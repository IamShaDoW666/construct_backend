import db from "../utils/db";
import { Response, Request } from "express";
import { sendError, sendSuccess } from "../utils/network";
import { ImageType } from "@prisma/client";
import { createReference } from "../utils/common";
import path from "path";
import fs from "fs/promises";

const getAllMedia = async (req: Request, res: Response) => {
  const media = await db.media.findMany({
    where: {
      uploadedUser: {
        id: req.user!.id,
      },
    },
  });
  const transformedMedia = media.map((item) => {
    return {
      ...item,
      url: `${process.env.BASE_URL}/${item.url}`,
    };
  });
  sendSuccess(res, transformedMedia);
};

const getMediaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const media = await db.media.findUnique({
    where: {
      id: id,
    },
  });
  if (!media) {
    sendError(res, "Media not found", 404);
    return;
  }
  sendSuccess(res, media);
};

const createBulkMedia = async (req: Request, res: Response) => {
  if (!req.files) {
    sendError(res, "No files uploaded", 400);
    return;
  }

  const files = req.files as Express.Multer.File[];
  const ref = createReference(req.body.reference);

  try {
    const batch = await db.batch.create({
      data: {
        name: "Bulk_" + Date.now().toString(),
        reference: ref,
        createdBy: {
          connect: {
            id: req.user!.id,
          },
        },
      },
    });

    const mediaData = files.map((file) => ({
      title: file.filename,
      type: ImageType.UPLOAD,
      reference: ref + Math.random().toString(36).slice(2, 5),
      url: file.path,
      uploadedUserId: req.user!.id,
      batchId: batch.id,
    }));

    const media = await db.media.createMany({
      data: mediaData,
    });

    sendSuccess(res, media, "Media uploaded successfully", 201);
  } catch (error) {
    sendError(res, `Error uploading media ${error}`, 500);
  }
};

const deleteBulkMedia = async (req: Request, res: Response) => {
  const { mediaIds } = req.body;
  console.log("mediaIds", mediaIds);
  if (!mediaIds || mediaIds.length === 0) {
    sendError(res, "No media IDs provided", 400);
    return;
  }
  const mediaRecords = await db.media.findMany({
    where: {
      id: {
        in: mediaIds,
      },
    },
  });
  const deleteFilePromises = mediaRecords.map(async (media) => {
    const filePath = path.resolve(media.url); // Adjust if 'filepath' includes full path
    try {
      await fs.unlink(filePath);
      await db.media.delete({
        where: {
          id: media.id,
        },
      });
    } catch (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
      // Optionally handle specific errors, e.g., file not found
    }
  });

  await Promise.all(deleteFilePromises);
  sendSuccess(res, mediaIds, "Media deleted successfully", 204);
};

const updateBulkMedia = async (req: Request, res: Response) => {
  console.log("res", req.body);
  console.log("files", req.files);
  if (!req.files && !req.body.reference) {
    sendError(res, "No files uploaded", 400);
    return;
  }

  if (!req.body.batchId) {
    sendError(res, "Batch ID is required", 400);
    return;
  }

  const batch = await db.batch.findUnique({
    where: {
      id: req.body.batchId,
    },
  });

  if (!batch) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }

  const files = req.files as Express.Multer.File[];
  let ref = batch.reference;
  if (batch.reference !== req.body.reference) {
    ref = batch.reference?.slice(0, 7) + req.body.reference;
  }

  try {
    const response = await db.batch.update({
      data: {
        reference: ref,
      },
      where: {
        id: batch.id,
      },
    });

    const mediaData = files.map((file) => ({
      title: file.filename,
      type: ImageType.UPLOAD,
      reference: ref + Math.random().toString(36).slice(2, 5),
      url: file.path,
      uploadedUserId: req.user!.id,
      batchId: batch.id,
    }));

    await db.media.createMany({
      data: mediaData,
    });

    const responseData = await db.media.findMany({
      where: {
        batchId: batch.id,
      },
    });
    sendSuccess(res, responseData, "Media uploaded successfully", 201);
  } catch (error) {
    sendError(res, `Error uploading media ${error}`, 500);
  }
};

const createMedia = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { filename, mimetype, path } = req.file;

  try {
    const media = await db.media.create({
      data: {
        title: filename,
        type: "UPLOAD",
        reference: filename + Date.now().toString(),
        url: path,
        batch: {
          connectOrCreate: {
            where: {
              reference: req.body.reference,
            },
            create: {
              name: "Bulk_" + Date.now().toString(),
              reference: "REF" + req.body.reference,
              createdBy: {
                connect: {
                  id: req.user!.id,
                },
              },
            },
          },
        },
        uploadedUser: {
          connect: {
            id: req.user!.id,
          },
        },
      },
    });

    sendSuccess(res, media, "Media uploaded successfully", 201);
  } catch (error) {
    sendError(res, "Error uploading media", 500);
  }
};

const deleteMedia = async (req: Request, res: Response) => {
  const { id } = req.params;
  const response = await db.media.delete({
    where: {
      id: id,
    },
  });
  sendSuccess(res, response, "Media deleted successfully", 204);
};

const mediaController = {
  getAllMedia,
  createMedia,
  createBulkMedia,
  updateBulkMedia,
  deleteMedia,
  deleteBulkMedia,
};

export default mediaController;
