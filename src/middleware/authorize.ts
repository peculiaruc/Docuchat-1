import { Request, Response, NextFunction } from "express";

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {S
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
