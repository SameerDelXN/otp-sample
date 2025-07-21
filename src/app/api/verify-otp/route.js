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

    // await dbConnect();

    // // Find or create user
    // let user = await User.findOne({ phone: fullPhoneNumber });
    // const isNewUser = !user;

    // if (!user) {
    //   user = new User({
    //     phone: fullPhoneNumber,
    //     isVerified: false,
    //     phoneIsVerified: true,
    //     lastLoginAt: new Date()
    //   });
    //   await user.save();
    // } else {
    //   user.lastLoginAt = new Date();
    //   user.phoneIsVerified = true;
    //   if (!user.isVerified) user.isVerified = false;
    //   await user.save();
    // }

    // otpStore.delete(fullPhoneNumber);

    // // Create session token
    // const token = createToken(user._id);
    // const response = NextResponse.json({
    //   success: true,
    //   message: "OTP verified successfully",
    //   userId: user._id,
    //   isNewUser,
    //   user: {
    //     phone: user.phone,
    //     isVerified: user.isVerified,
    //     phoneIsVerified: user.phoneIsVerified
    //   }
    // });

    // // Set HTTP-only cookie
    // setTokenCookie(response, token);
    console.log("otp verified")
    const response = "OTP VErifued Successfully"
    return NextResponse.json({success:true})
    return response;

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, error: "Error verifying OTP" },
      { status: 500 }
    );
  }
}