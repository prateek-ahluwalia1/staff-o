import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary hover:underline font-medium"
              >
                try again
              </button>
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight lg:hidden mb-2">
          Staffo
        </h1>
        <h2 className="text-xl font-semibold">Forgot password?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg">Reset Password</CardTitle>
          <CardDescription>Enter your registered email address</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
            <Link
              to="/login"
              className="text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Back to Sign In
            </Link>
          </CardFooter>
        </form>
      </Card>
    </>
  );
};

export default ForgotPassword;
