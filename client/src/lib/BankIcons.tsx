import { CreditCard, Wallet, Building, PiggyBank, LandPlot, Landmark } from "lucide-react";

export type BankIconType = 
  | "credit-card" 
  | "wallet" 
  | "building" 
  | "piggy-bank" 
  | "land-plot" 
  | "landmark";

interface BankIconProps {
  type: BankIconType;
  className?: string;
  size?: number;
}

export function BankIcon({ type, className = "", size = 24 }: BankIconProps) {
  const iconProps = {
    size,
    className
  };
  
  switch (type) {
    case "credit-card":
      return <CreditCard {...iconProps} />;
    case "wallet":
      return <Wallet {...iconProps} />;
    case "building":
      return <Building {...iconProps} />;
    case "piggy-bank":
      return <PiggyBank {...iconProps} />;
    case "land-plot":
      return <LandPlot {...iconProps} />;
    case "landmark":
      return <Landmark {...iconProps} />;
    default:
      return <CreditCard {...iconProps} />;
  }
}

export function getIconForAccountType(accountType: string): BankIconType {
  const type = accountType.toLowerCase();
  
  if (type.includes("checking")) {
    return "credit-card";
  } else if (type.includes("savings")) {
    return "piggy-bank";
  } else if (type.includes("mortgage") || type.includes("loan")) {
    return "building";
  } else if (type.includes("investment")) {
    return "landmark";
  } else if (type.includes("credit")) {
    return "credit-card";
  } else {
    return "wallet";
  }
}

export function getBgColorForAccountType(accountType: string): string {
  const type = accountType.toLowerCase();
  
  if (type.includes("checking")) {
    return "bg-primary bg-opacity-10";
  } else if (type.includes("savings")) {
    return "bg-green-100";
  } else if (type.includes("mortgage") || type.includes("loan")) {
    return "bg-red-100";
  } else if (type.includes("investment")) {
    return "bg-purple-100";
  } else if (type.includes("credit")) {
    return "bg-amber-100";
  } else {
    return "bg-blue-100";
  }
}

export function getTextColorForAccountType(accountType: string): string {
  const type = accountType.toLowerCase();
  
  if (type.includes("checking")) {
    return "text-primary";
  } else if (type.includes("savings")) {
    return "text-green-600";
  } else if (type.includes("mortgage") || type.includes("loan")) {
    return "text-red-600";
  } else if (type.includes("investment")) {
    return "text-purple-600";
  } else if (type.includes("credit")) {
    return "text-amber-600";
  } else {
    return "text-blue-600";
  }
}
