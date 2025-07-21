import otpStore from "@/lib/otpstore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { phoneNumber, otp } = await req.json();

    // Input validation
    if (!phoneNumber || phoneNumber.length !== 10 || !otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number or OTP" },
        { status: 400 }
      );
    }

    const fullPhoneNumber = `+91${phoneNumber}`;
    const storedOTP = otpStore.get(fullPhoneNumber);

    console.log('Stored OTP:', storedOTP); // Debug log
    console.log('Received OTP:', otp); // Debug log

    // OTP verification
    if (!storedOTP) {
      return NextResponse.json(
        { success: false, error: "OTP expired or not sent" },
        { status: 400 }
      );
    }

    if (storedOTP !== otp.toString()) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Clear OTP after successful verification
    otpStore.delete(fullPhoneNumber);

    console.log("OTP verified successfully");
    return NextResponse.json({ 
      success: true,
      message: "OTP verified successfully" 
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, error: "Error verifying OTP" },
      { status: 500 }
    );
  }
}