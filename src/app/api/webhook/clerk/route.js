import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import connectToDatabase from '../../../../lib/mongoose';
import User from '../../../../models/User';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  await connectToDatabase();

  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  try {
    switch (eventType) {
      case 'user.created':
        await User.create({
          clerkId: id,
          email: email_addresses[0]?.email_address,
          firstName: first_name,
          lastName: last_name,
          fullName: `${first_name || ''} ${last_name || ''}`.trim(),
          imageUrl: image_url,
          createdAt: new Date(),
        });
        console.log('User created:', id);
        break;

      case 'user.updated':
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            email: email_addresses[0]?.email_address,
            firstName: first_name,
            lastName: last_name,
            fullName: `${first_name || ''} ${last_name || ''}`.trim(),
            imageUrl: image_url,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
        console.log('User updated:', id);
        break;

      case 'user.deleted':
        await User.findOneAndDelete({ clerkId: id });
        console.log('User deleted:', id);
        break;

      default:
        console.log('Unhandled event type:', eventType);
    }

    return NextResponse.json({ message: 'Webhook handled successfully' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Error handling webhook' },
      { status: 500 }
    );
  }
}
