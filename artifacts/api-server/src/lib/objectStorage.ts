import { Storage, File } from "@google-cloud/storage";
import { promises as fsPromises } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "stream";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT = process.env.REPLIT_SIDECAR_ENDPOINT;
const GCP_PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT_ID ||
  "";
const LOCAL_OBJECT_STORAGE_DIR =
  process.env.LOCAL_OBJECT_STORAGE_DIR || "data/object-storage";
const USE_LOCAL_OBJECT_STORAGE =
  process.env.USE_LOCAL_OBJECT_STORAGE === "true" ||
  (!REPLIT_SIDECAR_ENDPOINT &&
    !hasGoogleCredentialsConfigured());

export const objectStorageClient = new Storage(
  GCP_PROJECT_ID ? { projectId: GCP_PROJECT_ID } : undefined,
);

interface LocalObjectFile {
  objectId: string;
  fullPath: string;
}

function hasGoogleCredentialsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GOOGLE_CLOUD_KEYFILE_JSON ||
    process.env.GOOGLE_CLOUD_KEYFILE_PATH ||
    process.env.GOOGLE_CLOUD_CREDENTIALS ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT_ID,
  );
}

function getLocalObjectStorageRoot(): string {
  return path.resolve(process.cwd(), LOCAL_OBJECT_STORAGE_DIR);
}

async function ensureLocalObjectStorageRoot(): Promise<void> {
  await fsPromises.mkdir(getLocalObjectStorageRoot(), { recursive: true });
}

function getLocalObjectPath(objectId: string): string {
  return path.join(getLocalObjectStorageRoot(), objectId);
}

function getLocalObjectMetadataPath(objectId: string): string {
  return `${getLocalObjectPath(objectId)}.json`;
}

async function localObjectExists(objectId: string): Promise<boolean> {
  try {
    await fsPromises.access(getLocalObjectPath(objectId), fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function getLocalObjectMetadata(objectId: string) {
  const filePath = getLocalObjectPath(objectId);
  const metadataPath = getLocalObjectMetadataPath(objectId);
  const stats = await fsPromises.stat(filePath);
  const metadata = {
    contentType: "application/octet-stream",
    size: stats.size,
    updatedAt: stats.mtime.toISOString(),
  };

  try {
    const rawMetadata = await fsPromises.readFile(metadataPath, "utf-8");
    const parsed = JSON.parse(rawMetadata) as { contentType?: string };
    if (parsed?.contentType) {
      metadata.contentType = parsed.contentType;
    }
  } catch {
    // ignore missing metadata file and fall back to defaults
  }

  return metadata;
}

async function saveLocalObject(objectId: string, contentType: string, stream: Readable): Promise<void> {
  await ensureLocalObjectStorageRoot();
  const filePath = getLocalObjectPath(objectId);
  const metadataPath = getLocalObjectMetadataPath(objectId);

  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    stream.on("error", reject);
    writeStream.on("error", reject);
    writeStream.on("finish", resolve);
    stream.pipe(writeStream);
  });

  await fsPromises.writeFile(
    metadataPath,
    JSON.stringify({ contentType, uploadedAt: new Date().toISOString() }),
    "utf-8",
  );
}

function isLocalObjectStorageEnabled(): boolean {
  return USE_LOCAL_OBJECT_STORAGE;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  async downloadObject(file: File | LocalObjectFile, cacheTtlSec: number = 3600): Promise<Response> {
    if ("fullPath" in file) {
      const metadata = await getLocalObjectMetadata(file.objectId);
      const nodeStream = fs.createReadStream(file.fullPath);
      const webStream = Readable.toWeb(nodeStream) as ReadableStream;

      const headers: Record<string, string> = {
        "Content-Type": metadata.contentType,
        "Cache-Control": `private, max-age=${cacheTtlSec}`,
        "Content-Length": String(metadata.size),
      };

      return new Response(webStream, { headers });
    }

    const [metadata] = await file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(file);
    const isPublic = aclPolicy?.visibility === "public";

    const nodeStream = file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers: Record<string, string> = {
      "Content-Type": (metadata.contentType as string) || "application/octet-stream",
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) {
      headers["Content-Length"] = String(metadata.size);
    }

    return new Response(webStream, { headers });
  }

  async getObjectEntityUploadURL(): Promise<{ uploadURL: string; objectPath: string }> {
    const objectId = randomUUID();

    if (isLocalObjectStorageEnabled()) {
      return {
        uploadURL: `/api/storage/local-uploads/${objectId}`,
        objectPath: `/objects/${objectId}`,
      };
    }

    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }

    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    const uploadURL = await signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });

    return {
      uploadURL,
      objectPath: `/objects/${objectId}`,
    };
  }

  async getObjectEntityFile(objectPath: string): Promise<File | LocalObjectFile> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const entityId = objectPath.slice("/objects/".length);
    if (!entityId) {
      throw new ObjectNotFoundError();
    }

    if (isLocalObjectStorageEnabled()) {
      const exists = await localObjectExists(entityId);
      if (!exists) {
        throw new ObjectNotFoundError();
      }
      return {
        objectId: entityId,
        fullPath: getLocalObjectPath(entityId),
      };
    }

    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    if (isLocalObjectStorageEnabled()) {
      throw new Error("ACL policy operations are not supported for local object storage");
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile as File, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: File;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }

  async saveLocalObjectFromBuffer(
    objectId: string,
    contentType: string,
    buffer: Buffer,
  ): Promise<void> {
    await ensureLocalObjectStorageRoot();
    const filePath = getLocalObjectPath(objectId);
    const metadataPath = getLocalObjectMetadataPath(objectId);

    await fsPromises.writeFile(filePath, buffer);
    await fsPromises.writeFile(
      metadataPath,
      JSON.stringify({ contentType, uploadedAt: new Date().toISOString() }),
      "utf-8",
    );
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  if (REPLIT_SIDECAR_ENDPOINT) {
    const request = {
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    };
    const response = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(30_000),
      }
    );
    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(
        `Failed to sign object URL, errorcode: ${response.status}, body: ${bodyText}`
      );
    }

    const body = (await response.json()) as Record<string, unknown>;
    const signedURL = typeof body["signed_url"] === "string" ? (body["signed_url"] as string) : undefined;
    if (!signedURL) {
      throw new Error(
        `Failed to sign object URL: unexpected response shape or missing signed_url (status: ${response.status})`,
      );
    }
    return signedURL;
  }

  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);
  const action =
    method === "PUT"
      ? "write"
      : method === "DELETE"
      ? "delete"
      : method === "HEAD"
      ? "read"
      : "read";

  const [signedURL] = await file.getSignedUrl({
    version: "v4",
    action,
    expires: Date.now() + ttlSec * 1000,
    contentType: method === "PUT" ? "application/octet-stream" : undefined,
  });

  return signedURL;
}
