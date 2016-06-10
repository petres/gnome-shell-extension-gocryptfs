const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Util = imports.misc.util;
const PopupGocryptfsItem = Me.imports.popupGocryptfsItem.PopupGocryptfsItem;


const GocryptfsManager = new Lang.Class({
    Name: 'GocryptfsManager',
    Extends: PanelMenu.Button,

    _entries: [
        {
            name: "Abteil",
            mount: "/home/peter/Cloud/secure/abteil",
            source: "/home/peter/Cloud/abteil/Cipher"
        },{
            name: "Dropbox",
            mount: "/home/peter/Cloud/secure/dropbox",
            source: "/home/peter/Cloud/Dropbox/Cipher"
        }
    ],

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);
        
        //this._settings = Convenience.getSettings();
        //this._settings.connect('changed', Lang.bind(this, this._loadConfig));

        //this._loadConfig();

        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        let icon = new St.Icon({icon_name: 'network-wireless-encrypted-symbolic', style_class: 'system-status-icon'});
        hbox.add_child(icon);

        this.actor.add_actor(hbox);
        this.actor.add_style_class_name('panel-status-button');

        this.actor.connect('button-press-event', Lang.bind(this, function() {
            this._refresh();
        }));

        Main.panel.addToStatusArea('GocryptfsManager', this);
        
        this._refresh();
    },
    _getCommand: function(info, action) {
        let command = ""
        if (action == "unmount")
            command = "fusermount -u '" + info['mount']  + "'"
        else if (action == "mount")
            command = "gocryptfs -extpass 'zenity --password' '" + info['source']  + "' '" + info['mount']  + "' > /dev/null"
        else if (action == "is-mounted")
            command = "mount -l | grep " + info['mount']
        else if (action == "open")
            command = "xdg-open '" + info['mount'] + "'"

        return 'sh -c "' + command + '; exit;"'
    },
    _refresh: function() {
        this.menu.removeAll();
        this._entries.forEach(Lang.bind(this, function(info) {
            let [_, out, err, stat] = GLib.spawn_command_line_sync(
                 this._getCommand(info, 'is-mounted'));
            
            let mounted = (stat == 0);

            let mountItem = new PopupGocryptfsItem(info['name'], mounted);
            this.menu.addMenuItem(mountItem);



            mountItem.connect('toggled', Lang.bind(this, function() {
                GLib.spawn_command_line_async(
                    this._getCommand(info, (mounted ? 'unmount' : 'mount')));
            }));

            // if (mounted)
            //     mountItem.openFolderButton.show()
            // else
            //     mountItem.openFolderButton.hide()

            mountItem.openFolderButton.connect('clicked', Lang.bind(this, function() {
                GLib.spawn_command_line_async(
                    this._getCommand(info, "open"));
                this.menu.close();
            }));
        }));

        /*if(this._entries.length > 0)
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        let item = new PopupMenu.PopupMenuItem(_("Add systemd services ..."));
        item.connect('activate', Lang.bind(this, function() {
            Util.spawn(["gnome-shell-extension-prefs", "gocryptfs@abteil.org"]);
            this.menu.close();
        }));
        this.menu.addMenuItem(item);
        return true;*/
    }
});

let gocryptfsManager;

function enable() {
    gocryptfsManager = new GocryptfsManager();
}

function disable() {
    gocryptfsManager.destroy();
}