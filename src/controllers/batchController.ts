import db from "../utils/db";
import { Response, Request } from "express";
import { sendError, sendSuccess } from "../utils/network";
import path from "path";
import fs from "fs/promises";
const getAllBatch = async (req: Request, res: Response) => {
  const batch = await db.batch.findMany({
    where: {
      createdBy: {
        id: req.user!.id,
      },      
    },
    include: {      
      media: true,
      createdBy: true
    },
    orderBy: {
      createdAt: "desc",
    }
  });

  const transformedBatch = batch.map((item) => {
    return {
      ...item,
      media: item.media.map((media) => ({
        ...media,
        url: `${process.env.BASE_URL}/${media.url}`,
      })),
    };
  });
  sendSuccess(res, transformedBatch);
};

const getBatchById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const batch = await db.batch.findUnique({
    where: {
      id: id,
    },
  });
  if (!batch) {
    sendError(res, "Batch not found", 404);
    return;
  }
  sendSuccess(res, batch);
};

const createBatch = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { filename, mimetype, path } = req.file;

  try {
    const batch = await db.batch.create({
      data: {
        name: req.body.name,        
        reference: req.body.reference,        
        createdBy: {
          connect: {
            id: req.user!.id,
          },
        },
      },
    });

    sendSuccess(res, batch, "Batch uploaded successfully", 201);
  } catch (error) {
    sendError(res, "Error uploading batch", 500);
  }
};

const deleteBatch = async (req: Request, res: Response) => {
  const { id } = req.params;
  const batch = await db.batch.findUnique({
    where: {
      id: id,
    },
    include: {
      media: true,
    },
  });
  if (!batch) {
    sendError(res, "Batch not found", 404);
    return;
  }

  const deleteFilePromises = batch.media.map(async (media) => {
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
  const response = await db.batch.delete({
    where: {
      id: id,
    },
  });
  sendSuccess(res, response, "Batch deleted successfully", 204);
};

const batchController = {
  getAllBatch,
  createBatch,  
  deleteBatch,
};

export default batchController;
