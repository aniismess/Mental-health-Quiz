
import { VAK_QUESTIONS } from "@/components/vak-questions";
import { STATEMENTS as EI_STATEMENTS } from "@/components/ei-questions";
import { REP_SYSTEM_QUESTIONS } from "@/components/rep-system-questions";

/**
 * Generates a CSV string from an array of objects.
 * @param headers The headers for the CSV file.
 * @param rows The data rows.
 * @returns A string representing the data in CSV format.
 */
function Csv(headers: string[], rows: any[][]): string {
  const csvRows = [headers, ...rows];
  return csvRows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) {
            return '""';
          }
          const str = String(cell);
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");
}

/**
 * Triggers the download of a CSV file in the browser.
 * @param content The CSV content.
 * @param filename The desired filename for the downloaded file.
 */
export function downloadCSV(content: string, filename: string): void {
  if (!content) {
    console.warn("CSV content is empty. Download aborted.");
    return;
  }
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a mapping from database column names to human-readable CSV headers.
 * @param dbHeaders An array of database column names.
 * @returns A dictionary mapping DB names to friendly names.
 */
function createHeaderMapping(dbHeaders: string[]): { [key: string]: string } {
  const mapping: { [key: string]: string } = {};

  // First, create default friendly names (e.g., user_name -> User Name)
  dbHeaders.forEach(header => {
    mapping[header] = header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  });

  // Override with specific question text for question columns
  VAK_QUESTIONS.forEach((q, i) => {
    const key = `vak_q${i + 1}_selected_value`;
    if (mapping[key]) {
      mapping[key] = q.text;
    }
  });

  EI_STATEMENTS.forEach((statement, i) => {
    const key = `ei_s${i + 1}_response_value`;
    if (mapping[key]) {
      mapping[key] = statement;
    }
  });

  REP_SYSTEM_QUESTIONS.forEach((q, i) => {
    const qNum = i + 1;
    const questionText = q.text;
    const rankKeys = {
      visual_rank: "Visual Rank",
      auditory_rank: "Auditory Rank",
      kinesthetic_rank: "Kinesthetic Rank",
      auditory_digital_rank: "Auditory Digital Rank",
    };

    for (const [rankKey, rankText] of Object.entries(rankKeys)) {
      const dbKey = `rep_q${qNum}_${rankKey}`;
      if (mapping[dbKey]) {
        mapping[dbKey] = `${questionText} - (${rankText})`;
      }
    }
  });

  return mapping;
}

/**
 * Generates a CSV file from the comprehensive quiz data view based on the specified export type.
 * @param data The array of data from the `comprehensive_quiz_export` view.
 * @param exportType The type of export ('summary', 'vak', 'ei', 'rep', 'comprehensive').
 * @returns A string containing the generated CSV data.
 */
export function generateCSVFromViewData(data: any[], exportType: string): string {
  if (!data || data.length === 0) {
    return "";
  }

  const allDbHeaders = Object.keys(data[0]);

  // Define header groups based on DB column prefixes
  const baseUserHeaders = allDbHeaders.filter(
    (h) => h.startsWith("user_") || h === "session_id" || h === "session_started_at"
  );
  const vakHeaders = allDbHeaders.filter((h) => h.startsWith("vak_"));
  const eiHeaders = allDbHeaders.filter((h) => h.startsWith("ei_"));
  const repHeaders = allDbHeaders.filter((h) => h.startsWith("rep_"));
  const completionHeaders = allDbHeaders.filter(
    (h) => h.endsWith("_completed") || h === "all_completed" || h.includes("date")
  );

  let selectedDbHeaders: string[] = [];

  switch (exportType) {
    case "summary":
      selectedDbHeaders = [...baseUserHeaders, ...completionHeaders];
      break;
    case "vak":
      selectedDbHeaders = [...baseUserHeaders, ...vakHeaders];
      break;
    case "ei":
      selectedDbHeaders = [...baseUserHeaders, ...eiHeaders];
      break;
    case "rep":
      selectedDbHeaders = [...baseUserHeaders, ...repHeaders];
      break;
    case "comprehensive":
    default:
      selectedDbHeaders = allDbHeaders;
      break;
  }

  // Create the mapping for the selected headers
  const headerMapping = createHeaderMapping(selectedDbHeaders);

  // Generate the final user-facing headers for the CSV
  const finalCsvHeaders = selectedDbHeaders.map(dbHeader => headerMapping[dbHeader] || dbHeader);

  // Generate the rows using the original database headers to access the data
  const rows = data.map((row) => {
    return selectedDbHeaders.map((dbHeader) => row[dbHeader]);
  });

  return Csv(finalCsvHeaders, rows);
}
