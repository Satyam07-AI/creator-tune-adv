/**
 * Sends a contact form message to a configured webhook endpoint.
 *
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} message - The user's message.
 * @throws {Error} If the webhook URL is not configured or if the submission fails.
 */
export const sendContactMessage = async (name: string, email: string, message: string): Promise<void> => {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl === 'undefined') {
    console.error("Contact webhook URL is not configured.");
    // In a real app, you might want to avoid exposing this to the user.
    // For this tool, it's helpful for the developer to see the error.
    throw new Error("The contact form is currently not available. Please try again later.");
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: "CreatorTune Contact Form",
      embeds: [{
        title: "New Support Message",
        color: 15277667, // Purple color
        fields: [
          { name: "Name", value: name, inline: true },
          { name: "Email", value: email, inline: true },
          { name: "Message", value: message }
        ],
        timestamp: new Date().toISOString()
      }]
    }),
  });

  if (!response.ok) {
    // Attempt to get more info from the response body if possible
    const errorBody = await response.text();
    console.error("Failed to send contact message. Status:", response.status, "Body:", errorBody);
    throw new Error("There was a problem sending your message. Please try again.");
  }
};