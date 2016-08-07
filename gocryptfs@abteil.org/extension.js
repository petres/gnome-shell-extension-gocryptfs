const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const PasswordDialog = Me.imports.passwd.PasswordDialog;
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
    _loadConfig: function() {

    },
    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);
        
        this._settings = Convenience.getSettings();
        this._settings.connect('changed', Lang.bind(this, this._loadConfig));

        this._loadConfig();

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
    _getCommand: function(info, action, password) {
        let command = ""
        if (action == "unmount")
            command = "fusermount -u '" + info['mount']  + "'"
        else if (action == "mount") 
            command = "gocryptfs -extpass 'echo " + password + "' '" + info['source']  + "' '" + info['mount']  + "' > /dev/null"
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
                    if (mounted)
                        GLib.spawn_command_line_async(this._getCommand(info, 'unmount'));
                    else {
                        let dialog = new PasswordDialog("/home/peter/Cloud/abteil/Cipher")
                        dialog.open()
                        dialog.connect('password', Lang.bind(this, function(dialog) {
                                //let a = new Object()
                                // a.standard_input = null
                                // a.standard_output = 0
                                // a.standard_error = 0
                                // let [res, pid, in_fd, out_fd, err_fd] = GLib.spawn_async_with_pipes(
                                //     null, 
                                //     ['/usr/bin/gocryptfs', info['source'], info['mount']],
                                //     null, 
                                //     GLib.SpawnFlags.DO_NOT_REAP_CHILD + GLib.SpawnFlags.SEARCH_PATH /*+ GLib.SpawnFlags.STDERR_TO_DEV_NULL + GLib.SpawnFlags.STDOUT_TO_DEV_NULL*/, 
                                //     null,
                                //     null,
                                //     a);
                                // let i = null
                                // for (i in a)
                                //     log(i + " ------- " + a[i])
                                //GLib.spawn_async_with_pipes();
                                GLib.spawn_command_line_async(this._getCommand(info, 'mount', dialog.get_password()));
                            }));
                    }
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

        if(this._entries.length > 0)
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // let password = new PopupMenu.PopupMenuItem(_("Password Test ..."));
        // password.connect('activate', Lang.bind(this, function() {
        //         let dialog = new PasswordDialog("/home/peter/Cloud/abteil/Cipher")
        //         dialog.open()
        //         dialog.connect('password', Lang.bind(this, this._mount));
        //         this.menu.close();
        //     }));
        // this.menu.addMenuItem(password);

        let settings = new PopupMenu.PopupMenuItem(_("Settings ..."));
        settings.connect('activate', Lang.bind(this, function() {
                Util.spawn(["gnome-shell-extension-prefs", "gocryptfs@abteil.org"]);
                this.menu.close();
            }));
        this.menu.addMenuItem(settings);
        return true;
    }
});

let gocryptfsManager;

function enable() {
    gocryptfsManager = new GocryptfsManager();
}

function disable() {
    gocryptfsManager.destroy();
}