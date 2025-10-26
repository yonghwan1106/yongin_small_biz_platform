import { google } from 'googleapis';
import { User, Report } from '@/types';

// Google Sheets 인증 설정
const getGoogleSheetsClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Users Sheet 작업
export class UsersDB {
  private static SHEET_NAME = 'Users';

  static async create(user: Omit<User, 'userId' | 'createdAt' | 'isActive'> & { passwordHash: string }): Promise<User> {
    const sheets = getGoogleSheetsClient();
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const values = [[
      userId,
      user.email,
      user.passwordHash,
      user.storeName || '',
      user.storeCategory || '',
      user.storeAddress || '',
      user.storeLatLng || '',
      createdAt,
      createdAt, // lastLoginAt
      'TRUE', // isActive
      user.marketingConsent ? 'TRUE' : 'FALSE',
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:K`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return {
      userId,
      email: user.email,
      storeName: user.storeName,
      storeCategory: user.storeCategory,
      storeAddress: user.storeAddress,
      storeLatLng: user.storeLatLng,
      createdAt,
      lastLoginAt: createdAt,
      isActive: true,
      marketingConsent: user.marketingConsent,
    };
  }

  static async getPasswordHash(userId: string): Promise<string | null> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:K`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === userId) {
        return row[2]; // passwordHash at index 2
      }
    }

    return null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:K`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null; // Skip header row

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1] === email) {
        return this.rowToUser(row);
      }
    }

    return null;
  }

  static async findById(userId: string): Promise<User | null> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:K`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === userId) {
        return this.rowToUser(row);
      }
    }

    return null;
  }

  static async update(userId: string, updates: Partial<User>): Promise<User | null> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:K`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === userId) {
        // Update fields (passwordHash at index 2, so other fields shift by 1)
        if (updates.storeName !== undefined) row[3] = updates.storeName;
        if (updates.storeCategory !== undefined) row[4] = updates.storeCategory;
        if (updates.storeAddress !== undefined) row[5] = updates.storeAddress;
        if (updates.storeLatLng !== undefined) row[6] = updates.storeLatLng;
        if (updates.lastLoginAt !== undefined) row[8] = updates.lastLoginAt;
        if (updates.isActive !== undefined) row[9] = updates.isActive ? 'TRUE' : 'FALSE';
        if (updates.marketingConsent !== undefined) row[10] = updates.marketingConsent ? 'TRUE' : 'FALSE';

        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${this.SHEET_NAME}!A${i + 1}:K${i + 1}`,
          valueInputOption: 'RAW',
          requestBody: { values: [row] },
        });

        return this.rowToUser(row);
      }
    }

    return null;
  }

  private static rowToUser(row: any[]): User {
    return {
      userId: row[0],
      email: row[1],
      // row[2] is passwordHash (not returned)
      storeName: row[3] || undefined,
      storeCategory: (row[4] as any) || undefined,
      storeAddress: row[5] || undefined,
      storeLatLng: row[6] || undefined,
      createdAt: row[7],
      lastLoginAt: row[8] || undefined,
      isActive: row[9] === 'TRUE',
      marketingConsent: row[10] === 'TRUE',
    };
  }
}

// Reports Sheet 작업
export class ReportsDB {
  private static SHEET_NAME = 'Reports';

  static async create(report: Omit<Report, 'reportId' | 'createdAt'>): Promise<Report> {
    const sheets = getGoogleSheetsClient();
    const reportId = `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const values = [[
      reportId,
      report.userId,
      report.reportDate,
      report.content,
      report.summary,
      JSON.stringify(report.dataSnapshot || {}),
      'FALSE', // isRead
      '0', // feedback
      createdAt,
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:I`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return {
      reportId,
      userId: report.userId,
      reportDate: report.reportDate,
      content: report.content,
      summary: report.summary,
      dataSnapshot: report.dataSnapshot,
      isRead: false,
      feedback: 0,
      createdAt,
    };
  }

  static async findByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<Report[]> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:I`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    const reports: Report[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1] === userId) {
        reports.push(this.rowToReport(row));
      }
    }

    // Sort by date descending
    reports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

    return reports.slice(offset, offset + limit);
  }

  static async findById(reportId: string): Promise<Report | null> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:I`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === reportId) {
        return this.rowToReport(row);
      }
    }

    return null;
  }

  static async updateFeedback(reportId: string, feedback: 1 | -1 | 0): Promise<boolean> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:I`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return false;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === reportId) {
        row[7] = feedback.toString();
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${this.SHEET_NAME}!A${i + 1}:I${i + 1}`,
          valueInputOption: 'RAW',
          requestBody: { values: [row] },
        });
        return true;
      }
    }

    return false;
  }

  static async markAsRead(reportId: string): Promise<boolean> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${this.SHEET_NAME}!A:I`,
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return false;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === reportId) {
        row[6] = 'TRUE';
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${this.SHEET_NAME}!A${i + 1}:I${i + 1}`,
          valueInputOption: 'RAW',
          requestBody: { values: [row] },
        });
        return true;
      }
    }

    return false;
  }

  private static rowToReport(row: any[]): Report {
    return {
      reportId: row[0],
      userId: row[1],
      reportDate: row[2],
      content: row[3],
      summary: row[4],
      dataSnapshot: row[5] ? JSON.parse(row[5]) : undefined,
      isRead: row[6] === 'TRUE',
      feedback: parseInt(row[7]) as 0 | 1 | -1,
      createdAt: row[8],
    };
  }
}

// 초기 시트 생성 헬퍼 함수
export async function initializeSheets() {
  const sheets = getGoogleSheetsClient();

  try {
    // Users 시트 헤더 생성
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Users!A1:K1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'userId',
          'email',
          'passwordHash',
          'storeName',
          'storeCategory',
          'storeAddress',
          'storeLatLng',
          'createdAt',
          'lastLoginAt',
          'isActive',
          'marketingConsent',
        ]],
      },
    });

    // Reports 시트 헤더 생성
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Reports!A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'reportId',
          'userId',
          'reportDate',
          'content',
          'summary',
          'dataSnapshot',
          'isRead',
          'feedback',
          'createdAt',
        ]],
      },
    });

    console.log('Sheets initialized successfully');
  } catch (error) {
    console.error('Error initializing sheets:', error);
    throw error;
  }
}
