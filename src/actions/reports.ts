'use server';

import { db } from '../db';
import { generatedReports } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getSession } from '../lib/session';

export interface ReportData {
    imageId?: string;
    imageUrl?: string;
    reportContent: string;
    patientName?: string;
    modality?: string;
    studyDate?: string;
    bodyPart?: string;
    findings?: string;
    impression?: string;
    status?: string;
    reportType?: string;
    radiologist?: string;
}

export async function saveReport(data: ReportData) {
    try {
        const session = await getSession(); // TODO: Implement getSession or pass userId
        const userId = session?.userId || 'default-user'; // Fallback for now

        const reportId = randomUUID();

        await db.insert(generatedReports).values({
            id: reportId,
            userId: userId as string,
            imageId: data.imageId,
            imageUrl: data.imageUrl,
            reportContent: data.reportContent,
            patientName: data.patientName || 'Unknown',
            modality: data.modality,
            studyDate: data.studyDate,
            bodyPart: data.bodyPart,
            findings: data.findings,
            impression: data.impression,
            status: data.status || 'Finalized',
            reportType: data.reportType || 'detailed',
            radiologist: data.radiologist || 'AI Assistant',
        });

        return { success: true, reportId };
    } catch (error) {
        console.error('Error saving report:', error);
        return { success: false, error: 'Failed to save report' };
    }
}

export async function getReports() {
    try {
        const session = await getSession();
        const userId = session?.userId || 'default-user';

        if (!userId) return { success: false, error: 'User not authenticated', reports: [] };

        const reports = await db
            .select()
            .from(generatedReports)
            .where(eq(generatedReports.userId, userId as string))
            .orderBy(desc(generatedReports.createdAt));

        return { success: true, reports };
    } catch (error) {
        console.error('Error fetching reports:', error);
        return { success: false, error: 'Failed to fetch reports', reports: [] };
    }
}

export async function getReport(reportId: string) {
    try {
        const [report] = await db
            .select()
            .from(generatedReports)
            .where(eq(generatedReports.id, reportId));

        if (!report) {
            return { success: false, error: 'Report not found' };
        }

        return { success: true, report };
    } catch (error) {
        console.error('Error fetching report:', error);
        return { success: false, error: 'Failed to fetch report' };
    }
}
