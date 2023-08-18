import { Composer } from "telegraf";
import { getStatInlineResults } from "./getStats";
import { getRecommendationInlineResults } from "./getRecommendations";

export const inline = Composer.on("inline_query", async (ctx) => {
  const { query } = ctx.inlineQuery;
  console.log(query);
  const results = [
    ...(await getStatInlineResults(query)),
    ...(await getRecommendationInlineResults(query)),
  ];

  return await ctx.answerInlineQuery(
    results.slice(0, 50).map((item, i) => ({
      id: i.toString(),
      type: "article",
      thumb_url: item.image,
      title: item.title,
      description: item.description,
      input_message_content: {
        message_text: item.message,
        parse_mode: "Markdown",
      },
    })),
  );
});
