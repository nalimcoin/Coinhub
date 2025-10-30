import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { Email } from '../models/Email';
import { Password } from '../models/Password';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware';

interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export class UserController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const users = await this.userRepository.findAll();

      res.status(200).json({
        message: 'Users retrieved successfully',
        users: users.map(user => user.toSafeObject()),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const user = await this.userRepository.findById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        message: 'User retrieved successfully',
        user: user.toSafeObject(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getCurrent = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await this.userRepository.findById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        message: 'Current user retrieved successfully',
        user: user.toSafeObject(),
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const targetUserId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(targetUserId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      // Users can only update their own profile
      if (userId !== targetUserId) {
        res.status(403).json({ error: 'Forbidden: You can only update your own profile' });
        return;
      }

      const { email, password, firstName, lastName } = req.body as UpdateUserRequest;

      const updateData: { email?: Email; password?: Password; firstName?: string; lastName?: string } = {};

      if (email) {
        updateData.email = new Email(email);
      }

      if (password) {
        updateData.password = await Password.createFromPlainText(password);
      }

      if (firstName) {
        updateData.firstName = firstName;
      }

      if (lastName) {
        updateData.lastName = lastName;
      }

      const updatedUser = await this.userRepository.update(targetUserId, updateData);

      res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser.toSafeObject(),
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const targetUserId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (isNaN(targetUserId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      // Users can only delete their own account
      if (userId !== targetUserId) {
        res.status(403).json({ error: 'Forbidden: You can only delete your own account' });
        return;
      }

      await this.userRepository.delete(targetUserId);

      res.status(200).json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
