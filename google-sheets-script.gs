const SHEET_NAME = 'Sheet1';
const SCRIPT_PROP = PropertiesService.getScriptProperties();

function setup() {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty('KEY', doc.getId());
}

function doGet(e) {
    return handleResponse(e);
}

function doPost(e) {
    return handleResponse(e);
}

function handleResponse(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty('KEY'));
        const sheet = doc.getSheetByName(SHEET_NAME);

        const result = e.parameter.action === 'get' ? getMessages(sheet) : addMessage(sheet, e.parameter.message);
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function getMessages(sheet) {
    const rows = sheet.getDataRange().getValues();
    const messages = rows.map(row => ({ message: row[0], timestamp: row[1] }));
    return { 'result': 'success', 'messages': messages };
}

function addMessage(sheet, message) {
    const timestamp = new Date().toISOString();
    sheet.appendRow([message, timestamp]);

    // Giữ lại tối đa 1000 dòng
    const rowCount = sheet.getLastRow();
    if (rowCount > 1000) {
        sheet.deleteRow(2); // Xóa dòng cũ nhất (bỏ qua tiêu đề)
    }

    return { 'result': 'success', 'message': { message, timestamp } };
}
