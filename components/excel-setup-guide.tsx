// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { FileSpreadsheet, Copy, CheckCircle } from "lucide-react"
// import { EXCEL_STRUCTURE } from "@/lib/excel-integration"

// export default function ExcelSetupGuide() {
//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text)
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto p-6">
//       <div className="text-center mb-8">
//         <FileSpreadsheet className="w-12 h-12 text-primary mx-auto mb-4" />
//         <h1 className="text-3xl font-bold mb-4 text-balance">Excel Integration Setup</h1>
//         <p className="text-muted-foreground text-balance">
//           Configure your Google Sheets or Excel Online to automatically update tournament data
//         </p>
//       </div>

//       <Tabs defaultValue="structure" className="w-full">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="structure">Sheet Structure</TabsTrigger>
//           <TabsTrigger value="setup">Setup Guide</TabsTrigger>
//           <TabsTrigger value="examples">Examples</TabsTrigger>
//         </TabsList>

//         <TabsContent value="structure" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileSpreadsheet className="w-5 h-5" />
//                 Matches Sheet Structure
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                   {EXCEL_STRUCTURE.matches.columns.map((column, index) => (
//                     <Badge key={index} variant="outline" className="justify-center">
//                       {column}
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="bg-muted p-4 rounded-lg">
//                   <p className="text-sm text-muted-foreground mb-2">Column Headers (Row 1):</p>
//                   <div className="flex items-center gap-2">
//                     <code className="text-xs bg-background px-2 py-1 rounded">
//                       {EXCEL_STRUCTURE.matches.columns.join(" | ")}
//                     </code>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => copyToClipboard(EXCEL_STRUCTURE.matches.columns.join("\t"))}
//                     >
//                       <Copy className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileSpreadsheet className="w-5 h-5" />
//                 Teams Sheet Structure
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//                   {EXCEL_STRUCTURE.teams.columns.map((column, index) => (
//                     <Badge key={index} variant="outline" className="justify-center">
//                       {column}
//                     </Badge>
//                   ))}
//                 </div>
//                 <div className="bg-muted p-4 rounded-lg">
//                   <p className="text-sm text-muted-foreground mb-2">Column Headers (Row 1):</p>
//                   <div className="flex items-center gap-2">
//                     <code className="text-xs bg-background px-2 py-1 rounded">
//                       {EXCEL_STRUCTURE.teams.columns.join(" | ")}
//                     </code>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => copyToClipboard(EXCEL_STRUCTURE.teams.columns.join("\t"))}
//                     >
//                       <Copy className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="setup" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Step-by-Step Setup</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="flex items-start gap-3">
//                   <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
//                     1
//                   </div>
//                   <div>
//                     <h3 className="font-semibold">Create Google Sheet</h3>
//                     <p className="text-sm text-muted-foreground">
//                       Create a new Google Sheet with two tabs: "Matches" and "Teams"
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
//                     2
//                   </div>
//                   <div>
//                     <h3 className="font-semibold">Add Column Headers</h3>
//                     <p className="text-sm text-muted-foreground">
//                       Copy the column headers from the Structure tab into row 1 of each sheet
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
//                     3
//                   </div>
//                   <div>
//                     <h3 className="font-semibold">Share Sheet</h3>
//                     <p className="text-sm text-muted-foreground">
//                       Make the sheet publicly viewable or share with the tournament admin
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
//                     4
//                   </div>
//                   <div>
//                     <h3 className="font-semibold">Get Sheet ID</h3>
//                     <p className="text-sm text-muted-foreground">
//                       Copy the Sheet ID from the URL and provide it to the tournament admin
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
//                 <div className="flex items-center gap-2 mb-2">
//                   <CheckCircle className="w-5 h-5 text-blue-600" />
//                   <h4 className="font-semibold text-blue-900 dark:text-blue-100">Pro Tip</h4>
//                 </div>
//                 <p className="text-sm text-blue-800 dark:text-blue-200">
//                   Use data validation in Excel to ensure consistent team names and match statuses. This prevents typos
//                   that could break the integration.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="examples" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Sample Match Data</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="bg-muted p-4 rounded-lg overflow-x-auto">
//                 <table className="w-full text-xs">
//                   <thead>
//                     <tr className="border-b">
//                       <th className="text-left p-2">matchId</th>
//                       <th className="text-left p-2">team1</th>
//                       <th className="text-left p-2">team2</th>
//                       <th className="text-left p-2">status</th>
//                       <th className="text-left p-2">team1Score</th>
//                       <th className="text-left p-2">team2Score</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr className="border-b">
//                       <td className="p-2">m1</td>
//                       <td className="p-2">SFC</td>
//                       <td className="p-2">PHANTOM FC</td>
//                       <td className="p-2">completed</td>
//                       <td className="p-2">2</td>
//                       <td className="p-2">1</td>
//                     </tr>
//                     <tr className="border-b">
//                       <td className="p-2">m2</td>
//                       <td className="p-2">CHICKEN FC</td>
//                       <td className="p-2">FC EEYELSEE B</td>
//                       <td className="p-2">upcoming</td>
//                       <td className="p-2"></td>
//                       <td className="p-2"></td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Goal Scorers Format</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <p className="text-sm text-muted-foreground">
//                   Goal scorers should be stored as JSON in the goalScorers column:
//                 </p>
//                 <div className="bg-muted p-4 rounded-lg">
//                   <code className="text-xs">
//                     [{"{"}"player":"John Doe","team":"SFC","minute":15{"}"},{"{"}"player":"Alex
//                     Johnson","team":"SFC","minute":35{"}"}]
//                   </code>
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() =>
//                     copyToClipboard(
//                       '[{"player":"John Doe","team":"SFC","minute":15},{"player":"Alex Johnson","team":"SFC","minute":35}]',
//                     )
//                   }
//                 >
//                   <Copy className="w-4 h-4 mr-2" />
//                   Copy Example
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }
