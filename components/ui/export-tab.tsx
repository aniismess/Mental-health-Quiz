import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportTabProps {
  value: string
  description: string
  onExport: () => void
  isExporting: boolean
  userCount: number
  buttonColor: string
  exportType: string
}

export function ExportTab({ value, description, onExport, isExporting, userCount, buttonColor, exportType }: ExportTabProps) {
  return (
    <TabsContent value={value} className="space-y-4 pt-4">
      <p className="text-sm text-gray-600">{description}</p>
      <Button onClick={onExport} disabled={isExporting} className={buttonColor}>
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "Exporting..." : `Export ${exportType} (${userCount} users)`}
      </Button>
    </TabsContent>
  )
}