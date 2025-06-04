import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

interface EditDetailsCardProps {
  label?: string;
  initialValue?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

export default function EditDetailsCard({
  label = "Enter new details",
  initialValue = "",
  onConfirm,
  onCancel,
}: EditDetailsCardProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
  }
  
  return (
    <div className="pointer-events-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{label}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter new value"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Confirm
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}