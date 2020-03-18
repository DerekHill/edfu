export interface VimeoGetVideoBody {
  uri: string;
  name: string;
  description: string;
  type: string;
  link: string;
  duration: number;
  width: number;
  language?: null;
  height: number;
  embed: Embed;
  created_time: string;
  modified_time: string;
  release_time: string;
  content_rating?: (string)[] | null;
  license?: null;
  privacy: Privacy;
  pictures: Pictures;
  tags?: (null)[] | null;
  stats: Stats;
  categories?: (null)[] | null;
  metadata: Metadata;
  user: User;
  review_page: ReviewPage;
  parent_folder?: null;
  last_user_action_event_date: string;
  files?: (FilesEntity)[] | null;
  download?: (DownloadEntity)[] | null;
  app: App;
  status: string;
  resource_key: string;
  upload: Upload;
  transcode: Transcode;
}
export interface Embed {
  buttons: Buttons;
  logos: Logos;
  title: Title;
  playbar: boolean;
  volume: boolean;
  speed: boolean;
  color: string;
  uri?: null;
  html: string;
  badges: Badges;
}
export interface Buttons {
  like: boolean;
  watchlater: boolean;
  share: boolean;
  embed: boolean;
  hd: boolean;
  fullscreen: boolean;
  scaling: boolean;
}
export interface Logos {
  vimeo: boolean;
  custom: Object;
}
export interface Title {
  name: string;
  owner: string;
  portrait: string;
}
export interface Badges {
  hdr: boolean;
  live: Object;
  staff_pick: Object;
  vod: boolean;
  weekend_challenge: boolean;
}
export interface Privacy {
  view: string;
  embed: string;
  download: boolean;
  add: boolean;
  comments: string;
}
export interface Pictures {
  uri: string;
  active: boolean;
  type: string;
  sizes?: (Object)[] | null;
  resource_key: string;
}
export interface Stats {
  plays: number;
}
export interface Metadata {
  connections: Connections;
  interactions: Interactions;
}
export interface Connections {
  comments: Object;
  credits: Object;
  likes: Object;
  pictures: Object;
  texttracks: Object;
  related?: null;
  recommendations: Object;
  albums: Object;
  available_albums: Object;
  available_channels: Object;
  versions: Object;
}
export interface Interactions {
  watchlater: Object;
  report: Object;
}
export interface User {
  uri: string;
  name: string;
  link: string;
  location: string;
  gender: string;
  bio?: null;
  short_bio?: null;
  created_time: string;
  pictures: Pictures1;
  websites?: (null)[] | null;
  metadata: Metadata1;
  location_details: LocationDetails;
  skills?: (null)[] | null;
  available_for_hire: boolean;
  preferences: Preferences;
  content_filter?: (string)[] | null;
  upload_quota: UploadQuota;
  resource_key: string;
  account: string;
}
export interface Pictures1 {
  uri?: null;
  active: boolean;
  type: string;
  sizes: Object[];
  resource_key: string;
}
export interface Metadata1 {
  connections: Object;
}
export interface LocationDetails {
  formatted_address: string;
  latitude?: null;
  longitude?: null;
  city?: null;
  state?: null;
  neighborhood?: null;
  sub_locality?: null;
  state_iso_code?: null;
  country?: null;
  country_iso_code?: null;
}
export interface Preferences {
  videos: Object;
}
export interface UploadQuota {
  space: Object;
  periodic: Object;
  lifetime: Object;
}
export interface ReviewPage {
  active: boolean;
  link: string;
}
export interface FilesEntity {
  quality: string;
  type: string;
  width?: number | null;
  height?: number | null;
  link: string;
  created_time: string;
  fps: number;
  size: number;
  md5: string;
}
export interface DownloadEntity {
  quality: string;
  type: string;
  width: number;
  height: number;
  expires: string;
  link: string;
  created_time: string;
  fps: number;
  size: number;
  md5: string;
}
export interface App {
  name: string;
  uri: string;
}
export interface Upload {
  status: string;
  link?: null;
  upload_link?: null;
  complete_uri?: null;
  form?: null;
  approach?: null;
  size?: null;
  redirect_url?: null;
}
export interface Transcode {
  status: string;
}
