import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.entity';
import * as fs from 'fs';
import { promisify } from 'util';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const mkdir = promisify(fs.mkdir);

import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find(); 
  }

  async findById(id: number): Promise<User> 
  {  
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, password_confirmation } = createUserDto;

    if (password !== password_confirmation) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const existingUser = await this.userRepository.findOneBy({ username });
    if (existingUser) {
      throw new ConflictException('Le nom d\'utilisateur est déjà utilisé');
    }

    const confirmationUrl = crypto.randomBytes(16).toString('hex');

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const userToCreate = { ...createUserDto, 
        confirmation_url: confirmationUrl,
        password: hashedPassword,
      };
      const user = this.userRepository.create(userToCreate);
      const savedUser = await this.userRepository.save(user);

      // Création du dossier
      const date = new Date();
      const folderName = `${savedUser.id}${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
      const publicFolderPath = join(__dirname, '..', '../public', 'storage', folderName);
      await mkdir(publicFolderPath);
      // Attribution du nom du dossier à l'utilisateur
      savedUser.folder = publicFolderPath;
      await this.userRepository.save(savedUser);

  
      return savedUser;
    } 
    catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('UNIQUE constraint failed: users.email')) {
        throw new ConflictException('L\'adresse email est déjà utilisée');
      } else {
        throw error;
      }
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    const { username, email, password, password_confirmation } = updateUserDto;

    if (password !== password_confirmation) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const confirmationUrl = crypto.randomBytes(16).toString('hex');

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const userToUpdate = { ...updateUserDto, 
        confirmation_url: confirmationUrl,
        password: hashedPassword,
      };
      const user = this.userRepository.create(userToUpdate);
      return await this.userRepository.save(user);;
    } 
    catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('UNIQUE constraint failed: users.email')) {
        throw new ConflictException('L\'adresse email est déjà utilisée');
      } else {
        throw error;
      }
    }
    // Object.assign(user, updateUserDto);
    // return this.userRepository.save(user);
  }

  async delete(id: number): Promise<any> 
  {
    const result = await this.userRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return result;
  }

  async updateAvatar(userId: number, avatarFile: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    try {

      const publicFolderPath = join(__dirname, '..', '../public', user.folder);
      console.log('dossier ...', publicFolderPath)
      await mkdir(publicFolderPath, { recursive: true });
    
      const avatarFileName = `${uuidv4()}${extname(avatarFile.originalname)}` //`avatar${extname(avatarFile.originalname)}`;
      const avatarPath = join(__dirname, '..', '../public', `${user.folder}/${avatarFileName}`);
  
      // if (user.avatar) {
      //   const previousAvatarPath = `${user.avatar}`;
      //   await fs.unlink(previousAvatarPath, (err) => {
      //     if (err) throw err;
      //     console.log('previousAvatarPath was deleted');
      //   });
      // }
   
      console.log(avatarFileName, avatarPath)
  
      // Déplacer le nouvel avatar vers le dossier d'uploads
      await fs.copyFile(avatarFile.path, avatarPath, (err) => {
        if (err) throw err;
        console.log('avatar was copied');
      });
  
      await fs.unlink(avatarFile.path, (err) => {
        if (err) throw err;
        console.log('upload tmp file was deleted');
      });
  
      user.avatar = `${user.folder}/${avatarFileName}`;
  

      return await this.userRepository.save(user);
    } catch (error) {
      console.log('error', error)
      throw new ConflictException('Erreur lors de la mise à jour de l\'avatar');
    }
  }

  async updateUsername(id: number, username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const existingUser = await this.userRepository.findOneBy({ username });
    if (existingUser) {
      throw new ConflictException('Le nom d\'utilisateur est déjà utilisé');
    }

    user.username = username;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  async updateEmail(id: number, email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const confirmationUrl = crypto.randomBytes(16).toString('hex');

    user.email = email;
    user.confirmation_url = confirmationUrl;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('L\'adresse email est déjà utilisée');
      } else {
        throw error;
      }
    }
  }

  async updatePassword(
    id: number,
    password: string,
    password_confirmation: string,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    if (password !== password_confirmation) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  async update2fa(id: number, is_2fa: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    user.is_2fa = is_2fa;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  async updateSocketId(id: number, socket_id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    user.socket_id = socket_id;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  async deleteSocketId(socket_id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ socket_id });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    user.socket_id = null;

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

}
