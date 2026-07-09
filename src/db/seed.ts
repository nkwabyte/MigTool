
import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function seed() {
    const hashedPassword = await bcrypt.hash('Password123', 10);
    const userId = randomUUID();

    try {
        await db.insert(users).values({
            id: userId,
            name: 'Test User',
            email: 'test@email.com',
            password: hashedPassword,
        });
        console.log('Test user created successfully!');
    } catch (error) {
        console.error('Error creating test user:', error);
    }
}

seed();
