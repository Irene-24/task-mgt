import React from "react";
import { CheckCircle2 } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
}

const AuthHeader = ({ title, subtitle }: Props) => {
  return (
    <div className="text-center space-y-2 mb-6">
      <div className="center mb-4">
        <div className="p-3 bg-primary rounded-lg">
          <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
