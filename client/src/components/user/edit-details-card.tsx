import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

interface EditDetailsCardProps {
  label?: string;
  initialValue?: string;
  onConfirm: (value: string) => void;
}

export default function EditDetailsCard({
  label = "Enter new details",
  initialValue = "",
  onConfirm,
}: EditDetailsCardProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
  }
  
  return (
    <div className="pointer-events-auto">
      <Card>
        <CardHeader>
          <CardTitle>{label}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter new value"
            />
            <Button type="submit">
              Confirm
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}