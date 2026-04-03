import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

const MAX_ATTEMPTS = 3;

// Hardcoded credentials for student prototype
const VALID_USER_ID = "1";
const VALID_PASSWORD = "12345";

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleLogin = () => {
    setError("");

    // Empty input check
    if (!userId.trim() || !password.trim()) {
      setError("Please enter both User ID and Password.");
      return;
    }

    // Check if locked out
    if (locked) {
      setError("Account locked. Too many failed attempts. Please refresh the page.");
      return;
    }

    // Authenticate
    if (userId === VALID_USER_ID && password === VALID_PASSWORD) {
      onLogin();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setError("Account locked after 3 failed attempts. Please refresh the page.");
      } else {
        setError(`Invalid ID or Password. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">💊 Pharmacy System</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Label>User ID</Label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter User ID"
              className="mt-1"
              disabled={locked}
            />
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter Password"
                disabled={locked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button onClick={handleLogin} className="w-full" size="lg" disabled={locked}>
            <LogIn className="w-4 h-4 mr-2" /> Login
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            Default: User ID <strong>1</strong> / Password <strong>12345</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
