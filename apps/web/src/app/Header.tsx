import FontsizeSelector from "@/components/fontsize-selector";
import { SettingsDrawer } from "@/components/settings-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { DatePicker } from "@/components/ui/date-picker";

export const Header = () => {
  return (
    <div className="flex items-center justify-between w-full gap-3 py-3 rounded">
      <DatePicker></DatePicker>
      <SettingsDrawer></SettingsDrawer>
      {/* on desktop the settings should expand */}
      <div className="items-center hidden gap-3 sm:flex">
        <FontsizeSelector sample={false}></FontsizeSelector>
        <ThemeToggle iconOnly={true} />
      </div>
    </div>
  );
};
