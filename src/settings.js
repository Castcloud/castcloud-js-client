var SettingType = {
	Text: 0,
	Bool: 1,
	Keybind: 2
};

var DefaultSettings = {
	General: {

	},
	Playback: {
		KeepPlaying: {
			type: SettingType.Bool,
			value: true
		},
		PlaybackRate: {
			type: SettingType.Text,
			value: 1.0
		}
	},
	Keybinds: {
		PlayPause: {
			type: SettingType.Keybind,
			value: 'space'
		},
		Next: {
			type: SettingType.Keybind,
			value: 'pageup'
		},
		Previous: {
			type: SettingType.Keybind,
			value: 'pagedown'
		},
		SkipForward: {
			type: SettingType.Keybind,
			value: 'right'
		},
		SkipBack: {
			type: SettingType.Keybind,
			value: 'left'
		}
	},
	Advanced: {
		SyncInterval: {
			type: SettingType.Text,
			value: 60
		}
	},
	__client: {
		ThumbWidth: {
			value: 200,
			clientspecific: true
		}
	}
};

module.exports = {
	SettingType: SettingType,
	DefaultSettings: DefaultSettings
};