import { DDBSettings, SettingsEntity } from "../../dataModel";

export const getSettingsFromTeamId = async (
  teamId: string
): Promise<DDBSettings> => {
  const settingsItems = await SettingsEntity.get({ teamId });

  let settings: DDBSettings;
  if (settingsItems.Item) {
    settings = settingsItems.Item;
  } else {
    const response = await SettingsEntity.update(
      {
        teamId,
      },
      { returnValues: "ALL_NEW" }
    );

    if (response.Attributes == null) {
      throw new Error("Failed to create settings");
    }

    settings = response.Attributes;
  }

  return settings;
};
