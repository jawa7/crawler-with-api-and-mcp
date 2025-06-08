export interface CrawledWebPage {
  uri: string;
  title: string;
  description: string;
  category: string;
  text: string;
  wholePage?: string;
}
