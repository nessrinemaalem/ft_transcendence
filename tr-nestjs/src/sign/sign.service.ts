import { BadRequestException, ConflictException, 
  Injectable, Res, Session,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from '../users/users.entity';
import * as fs from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { generateRandomCode } from './sign.utils';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';
import axios from 'axios';


const mkdir = promisify(fs.mkdir);

@Injectable()
export class SignService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}


  async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
    try {
      const formData = {
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        redirect_uri: 'http://localhost:8000/', // Votre URL de redirection
      };

      const response = await axios.post('https://api.intra.42.fr/oauth/token', formData);
      const accessToken = response.data.access_token;

      return { accessToken };
    } catch (error) {
      throw new BadRequestException('Error exchanging code for access token');
    }
  }

  async getUserData(accessToken: string): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get('https://api.intra.42.fr/v2/me', { headers });
      return response.data;
    } catch (error) {
      throw new BadRequestException('Error fetching user data');
    }
  }


  async auth42(): Promise<{ accessToken: string }> {
    try {
      const formData = {
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      };

      const response = await axios.post('https://api.intra.42.fr/oauth/token', formData);
      const accessToken = response.data.access_token;

      return { accessToken };
    } catch (error) {
      throw new BadRequestException('Erreur lors de l\'authentification 42');
    }
  }

  async signUp42(): Promise<any> { 
    try {
      const { accessToken } = await this.auth42();
      const headers = { Authorization: `Bearer ${accessToken}` };
      const response = await axios.get('https://api.intra.42.fr/v2/me', { headers });
      return response.data;
    } catch (error) {
      throw new BadRequestException('Erreur lors de la requête à l\'API 42');
    }
  }

  async getUsersData(): Promise<any> {
    try {
      const { accessToken } = await this.auth42();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get('https://api.intra.42.fr/v2/users', { headers });
      return response.data;
    } catch (error) {
      throw new BadRequestException('Erreur lors de la requête à l\'API 42');
    }
  }

  async signIn(
    email: string, password: string
  ): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
  
    if (!user) {
      throw new Error('Adresse e-mail incorrecte');
    }
  
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!passwordMatch) {
      throw new Error('Mot de passe incorrect');
    }
  
    if (user.is_2fa === 1) {
      const code = generateRandomCode(6);
      user.is_2fa_code = code;
      await this.userRepository.save(user);
  
      return { email: user.email, code, username: user.username };
      // try {
      //   await this.mailerService.sendMail({
      //     to: user.email,
      //     subject: 'Welcome to Nice App! Confirm your Email',
      //     template: './code',
      //     context: {
      //       code: code,
      //       name: user.username,
      //     },
      //   });
  
      //   return { email: user.email, code };
      // } catch (error) {
      //   // Gérer l'erreur liée à l'envoi de l'e-mail
      //   console.error('Erreur lors de l\'envoi de l\'e-mail de confirmation:', error);
      //   throw new Error('Erreur lors de l\'envoi de l\'e-mail de confirmation');
      // }
    }
  
    user.status = 1;
    await this.userRepository.save(user);
  
    return { user };
  }

  async signInCode(
    data: { email: string, code: string },
  ): Promise<User> {
    const { email, code } = data;
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new BadRequestException('Adresse e-mail incorrecte');
    }

    if (user.is_2fa !== 1 || user.is_2fa_code !== code) {
      throw new BadRequestException('Code incorrect');
    }

    user.is_2fa_code = null;
    user.status = 1;
    await this.userRepository.save(user);

    return user;
  }

  async signUp(
    username: string,
    email: string, 
    password: string, 
    password_confirmation: string
  ): Promise<any> {
    if (password !== password_confirmation) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // const passwordRegex = /^(?=.*[!@#])[A-Za-z0-9!@#]{6,}$/;
    // if (!passwordRegex.test(password)) {
    //   throw new BadRequestException('Le mot de passe doit contenir au moins un chiffre et un caractère spécial (!@#)');
    // }

    const existingUser = await this.userRepository.findOneBy({ username });
    if (existingUser) {
      throw new ConflictException('Le nom d\'utilisateur est déjà utilisé');
    }
    
    const confirmationUrl = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const userToCreate = {
        username,
        email,
        confirmation_url: confirmationUrl,
        password: hashedPassword,
        //is_2fa: 1
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

  async signUp42New(
    username: string,
    email: string,
    avatar: string,
  ): Promise<any> {

    let existingUser = await this.userRepository.findOneBy(
      { username, });
    if (existingUser) {

      if (existingUser.is_2fa === 1) {
        const code = generateRandomCode(6);
        existingUser.is_2fa_code = code;
        await this.userRepository.save(existingUser);
    
        return { email: existingUser.email, code, username: existingUser.username };
      }
    
      existingUser.status = 1;
      await this.userRepository.save(existingUser);
    
      return { user: existingUser };
    }

    const confirmationUrl = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash("123456", 10);

    try {
      const userToCreate = {
        username,
        email,
        confirmation_url: confirmationUrl,
        password: hashedPassword,
        avatar: avatar,
        //is_2fa: 1
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
  
      return  { user: savedUser };;
    } 
    catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('UNIQUE constraint failed: users.email')) {
        throw new ConflictException('L\'adresse email est déjà utilisée');
      } else {
        throw error;
      }
    }
  }

  async signOut(userId: number): Promise<void> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    user.status = 0;
    await this.userRepository.save(user);
  }

  async signCheck(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    user.status = 0;
    return user;
  }
}
