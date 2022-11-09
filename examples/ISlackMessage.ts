/* eslint-disable import/no-extraneous-dependencies */
import { Block, KnownBlock, MessageAttachment } from '@slack/web-api';

export interface ISlackMessageBotProfile {
  /** application 식별용 고유값 */
  app_id: string;
  /** 삭제 여부 */
  deleted: boolean;
  /**
   * 슬랙 메신져에서 노출되는 아이콘 링크, 크기별로 3개가 전달된다
   * * image_36
   * * image_48
   * * image_72
   * */
  icons: Record<string, string>;
  /** 슬랙 시스템 내부 처리용 고유 아이디 */
  id: string;
  /** 봇 이름 */
  name: string;
  /** 팀 식별용 고유 값 */
  team_id: string;
  /** 마지막 수정일자 */
  updated: number;
}

export interface ISlackMessageBody {
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  bot_id: string;
  bot_profile: ISlackMessageBotProfile;
  team: string;
  text: string;
  ts: string;
  type: string;
  user: string;
}
