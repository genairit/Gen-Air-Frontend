import AirRounded from "@mui/icons-material/AirRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import HvacRounded from "@mui/icons-material/HvacRounded";
import SyncRounded from "@mui/icons-material/SyncRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import HomeRounded from "@mui/icons-material/HomeRounded";
import InfoRounded from "@mui/icons-material/InfoRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import EmailRounded from "@mui/icons-material/EmailRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import TimelineRounded from "@mui/icons-material/TimelineRounded";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import MoreHorizRounded from "@mui/icons-material/MoreHorizRounded";
import ApartmentRounded from "@mui/icons-material/ApartmentRounded";
import FilterAltRounded from "@mui/icons-material/FilterAltRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import type { IconNameType } from "../../../constants/icon.constant";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import AddToDriveRounded from "@mui/icons-material/AddToDriveRounded";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import EngineeringRounded from "@mui/icons-material/EngineeringRounded";
import RequestQuoteRounded from "@mui/icons-material/RequestQuoteRounded";
import FolderSpecialRounded from "@mui/icons-material/FolderSpecialRounded";
import CreateNewFolderRounded from "@mui/icons-material/CreateNewFolderRounded";

export const ICON_COMPONENTS: Record<IconNameType, SvgIconComponent> = {
  add: AddRounded,
  air: AirRounded,
  erp: SyncRounded,
  edit: EditRounded,
  home: HomeRounded,
  hvac: HvacRounded,
  info: InfoRounded,
  more: MoreHorizRounded,
  open: OpenInNewRounded,
  save: SaveRounded,
  view: VisibilityRounded,
  done: VerifiedRounded,
  email: EmailRounded,
  phone: PhoneRounded,
  quote: RequestQuoteRounded,
  delete: DeleteRounded,
  filter: FilterAltRounded,
  folder: FolderRounded,
  logout: LogoutRounded,
  report: AssessmentRounded,
  search: SearchRounded,
  upload: CloudUploadRounded,
  gdrive: AddToDriveRounded,
  invoice: ReceiptLongRounded,
  foreman: EngineeringRounded,
  building: ApartmentRounded,
  contacts: GroupsRounded,
  customer: PersonRounded,
  location: PlaceRounded,
  document: DescriptionRounded,
  progress: TimelineRounded,
  projects: DashboardRounded,
  settings: SettingsRounded,
  newProject: CreateNewFolderRounded,
  projectFolder: FolderSpecialRounded,
};
