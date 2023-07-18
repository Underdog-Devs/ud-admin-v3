// Use the presigner library
import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Configuration: S3ClientConfig = {
	region: "us-east-2",
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
	},
};

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const fileName = searchParams.get("fileName");
	const preSignedUrl = await getPresignedUrl(fileName!);
	const signedUrlObject = { url: preSignedUrl };
	// Custom success response message.
	return NextResponse.json({
		message: "Success",
		signedUrlObject,
	});
}

// Presigned URL function
async function getPresignedUrl(fileName: string) {
	const s3 = new S3Client(s3Configuration);
	
	const command = new PutObjectCommand({ Bucket: "ud-media", Key: fileName, ACL: "bucket-owner-full-control" });
	const url = await getSignedUrl(s3, command);

	return url;
}