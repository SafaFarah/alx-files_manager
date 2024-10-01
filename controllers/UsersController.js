import sha1 from 'sha1';
import dbClient from '../utils/db';

const UsersController = {
  async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const existingUser = await dbClient.client.db().collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const result = await dbClient.client.db().collection('users').insertOne({
      email,
      password: sha1(password),
    });
    return res.status(201).json({
      id: result.insertedId.toString(),
      email,
    });
  },
};
export default UsersController;
