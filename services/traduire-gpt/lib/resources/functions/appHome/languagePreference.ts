import { Block, KnownBlock } from "@slack/bolt";

export const getLanguagePreferenceBlocks = (
  primaryLanguage: string,
  secondaryLanguage: string
): (Block | KnownBlock)[] => {
 
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Language Preference* 
        \nBy default, the app will translate to the default primary language which is English. If the text is in the primary language, the app will translate to the default secondary language which is French.
        \nTo change the primary and secondary languages, please select the languages from the dropdown below.`,
      },
    },
    {
      type: "input",
      block_id: "primary_language_input_block",
      element: {
        type: "static_select",
        action_id: "primary_language_input",
        placeholder: {
          type: "plain_text",
          text: "Select a language",
        },
        options: languages.map((language) => {
          return {
            text: {
              type: "plain_text",
              text: language,
            },
            value: language,
          };
        }),
      },
      label: {
        type: "plain_text",
        text: `Primary Language: ${primaryLanguage}`,
      },
    },
    {
      type: "input",
      block_id: "secondary_language_input_block",
      element: {
        type: "static_select",
        action_id: "secondary_language_input",
        placeholder: {
          type: "plain_text",
          text: "Select a language",
        },
        options: languages.map((language) => {
          return {
            text: {
              type: "plain_text",
              text: language,
            },
            value: language,
          };
        }),
      },
      label: {
        type: "plain_text",
        text: `Secondary Language: ${secondaryLanguage}`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Submit",
          },
          action_id: "submit_language_preference",
        },
      ],
    },
  ];
}

// 30 example languages
const languages = [
  "English",
  "French",
  "Spanish",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Turkish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Greek",
  "Hungarian",
  "Romanian",
  "Slovak",
  "Bulgarian",
  "Croatian",
  "Serbian",
  "Slovenian",
  "Lithuanian",
  "Latvian",
  "Estonian",
];