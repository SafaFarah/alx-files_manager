import Queue from 'bull/lib/queue';
import imageThumbnail from 'image-thumbnail';
import { promises as fs } from 'fs';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const fileQueue = new Queue('thumbnail generation');
const userQueue = new Queue('email sending');

const processThumbnailQueue = async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient.client.db().collection('files').findOne({
    _id: ObjectId(fileId),
    userId: ObjectId(userId),
  });

  if (!file) throw new Error('File not found');

  if (file.type !== 'image') {
    throw new Error('File is not an image');
  }

  const { localPath } = file;

  const sizes = [500, 250, 100];
  try {
    const thumbnailPromises = sizes.map(async (size) => {
      const thumbnail = await imageThumbnail(localPath, { width: size });
      const thumbnailPath = `${localPath}_${size}`;
      await fs.writeFile(thumbnailPath, thumbnail);
    });

    await Promise.all(thumbnailPromises);
    console.log(`Thumbnails generated for fileId: ${fileId}`);
  } catch (error) {
    console.error('Error generating thumbnails:', error);
  }
};

fileQueue.process(async (job) => {
  try {
    await processThumbnailQueue(job);
  } catch (error) {
    console.error('Error processing thumbnail queue:', error);
  }
});

userQueue.process(async (job) => {
  const userId = job.data.userId || null;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const userObjId = new ObjectId(userId);
  const userCollection = dbClient.client.db().collection('users');
  const user = await userCollection.findOne({ _id: userObjId });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
});

userQueue.on('failed', (job, err) => {
  console.error(`Job failed: ${job.id}, error: ${err.message}`);
});
