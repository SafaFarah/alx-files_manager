import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

const getStatus = async (req, res) => {
    const redisStatus = await redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    res.status(200).json({
        redis: redisStatus,
        db: dbStatus
    });
};

const getStats = async (req, res) => {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    res.status(200).json({
        users: usersCount,
        files: filesCount
    });
};
export { getStatus, getStats };
