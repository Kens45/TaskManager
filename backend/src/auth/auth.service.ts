import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(email: string, password: string, organizationName:string){
        console.log('register', email, password, organizationName);
        const hashedPassword = await bcrypt.hash(password, 10);

        let organization = await this.prismaService.organization.findUnique({
            where: {
                name: organizationName,
            },
        });
        if (!organization) {
            organization = await this.prismaService.organization.create({
                data: {
                    name: organizationName,
                },
            });
        }
        const user = await this.prismaService.user.create({
            data: {
                email: email,
                password: hashedPassword,
                organizationId: organization.id,
            },
        });
        return this.generateToken(user);
    }

    async login(email: string, password: string) {
        console.log('login', email, password);
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
            include: {
                organization: true,
            },
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        return this.generateToken(user);
    }

    private generateToken(user: any) {
        const payload = { sub: user.id, email: user.email, organizationId: user.organizationId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
