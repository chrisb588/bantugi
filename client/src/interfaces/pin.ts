
export default interface Pin {
  report_id: string;
  urgency: "Low" | "Medium" | "High";
  lat: number;
  lng: number;
}