import {prisma} from '../lib/prisma.js';

export const userRepository = {
    async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        });
    },
    async findUserById(id: string) {
        return prisma.user.findUnique({
            where: { id }
        });
    },

    async createUser(data: {
        name: string
        email: string; 
        password: string }) {
        return prisma.user.create({
            data
        });
    },

    async updateById(id: string, data: Partial <{
         name: string; 
         email: string; 
         isActive: string }>) {

        return prisma.user.update({
            where: { id },
            data
        });
    },

    async softDelete(id: string) {
        return prisma.user.update({
            where: { id },
            data: {deletedAt: new Date()},
        });
    }

};