const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Shell = imports.gi.Shell;

const St = imports.gi.St;

const ModalDialog = imports.ui.modalDialog;
const ShellEntry = imports.ui.shellEntry;

const Pango = imports.gi.Pango;

const PasswordDialog = new Lang.Class({
    Name: 'PasswordDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function(folder) {
        this.parent({ styleClass: 'prompt-dialog' });

        let mainContentBox = new St.BoxLayout({ 
                style_class: 'prompt-dialog-main-layout',
                vertical: false 
            });

        this.contentLayout.add(mainContentBox, { x_fill: true, y_fill: true });

        let messageBox = new St.BoxLayout({ 
                style_class: 'prompt-dialog-message-layout',
                vertical: true 
            });

        mainContentBox.add(messageBox, { y_align: St.Align.START });

        let subjectLabel = new St.Label({ 
                style_class: 'prompt-dialog-headline',
                text: "Please, type in your password to mount the encrypted folder '" + folder + "':"
            });
        
        subjectLabel.clutter_text.line_wrap = true;
        subjectLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD;
        subjectLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        messageBox.add(subjectLabel, { y_fill:  false, y_align: St.Align.START });
        
        // An entry for putting the password
        this._passwdEntry = new St.Entry({ 
                style_class: 'prompt-dialog-password-entry',
                text: "", 
                can_focus: true,
                reactive: true 
            });
        
        ShellEntry.addContextMenu(this._passwdEntry, { isPassword: true });
        
        this._passwdEntry.clutter_text.connect('activate', Lang.bind(this, this._onOk));
        this._passwdEntry.clutter_text.connect('text-changed', Lang.bind(this, this._updateOkButton));
        this._passwdEntry.clutter_text.set_password_char('\u25cf');
        
        // Creates a table so that we can fill up the box.
        
        //let table = new St.Table({ style_class: 'network-dialog-secret-table' });
        
        //table.add(this._passwdEntry, { row: pos, col: 1, x_expand: true, x_fill: true, y_align: St.Align.END });
        
        messageBox.add(this._passwdEntry);
        
        
        this._okButton = { 
                label:  _("Mount"),
                action: Lang.bind(this, this._onOk),
                key:    Clutter.KEY_Return,
            };

        this._cancelButton = { 
                label:  _("Cancel"),
                action: Lang.bind(this, this.cancel),
                key:    Clutter.KEY_Escape,
            };

        this.setButtons([this._cancelButton, this._okButton]);
        
        this._updateOkButton()
    },
    
    get_password: function() {
        return this._passwdEntry.get_text();
    },
    
    _updateOkButton: function() {        
        let valid = false
        if (this.get_password().length > 0)
            valid = true

        this._okButton.button.reactive = valid;
        this._okButton.button.can_focus = valid;
        
        if (valid)
            this._okButton.button.remove_style_pseudo_class('disabled');
        else
            this._okButton.button.add_style_pseudo_class('disabled');
    },
    
    _onOk: function() {
        this.emit('password');
        this.close(global.get_current_time());
    },
    
    cancel: function() {
        this.close(global.get_current_time());
    },
});