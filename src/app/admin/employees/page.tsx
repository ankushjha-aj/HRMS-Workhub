import { prisma } from '../../../lib/prisma';
import EmployeesClient from './EmployeesClient';

export default async function EmployeesPage() {
    const employees = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <EmployeesClient initialEmployees={employees} />;
}
