export interface PageInfo {
    total_pages: number;
}

export interface SDVXProfile {
    rival_id: string;
    player_name: string;
    volforce: number;
    
    appeal_title: string;
    appeal_card_id: string;

    play_count?: number;
    pcb_count?: number;

    skill_level_id?: string;
    skill_level_name?: string;

    arena_rank?: string;
    arena_count?: number;
    arena_power?: number;

    arena_power_date?: string;
    recent_play_date?: string;

    play_day_combo?: number;
    play_week_combo?: number;
}

export interface SDVXMusicPlayDataIndexData {
    music_id: string;
    title: string;
    artist: string;

    diff_list: Array<{
        ind: number;
        mark: string;
        grade: string;
        score: number;
    }>;
}

export interface SDVXMusicPlayDataIndex {
    page_info: PageInfo;
    data_list: SDVXMusicPlayDataIndexData[];
}