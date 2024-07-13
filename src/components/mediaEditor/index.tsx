import './mediaEdtior.scss';

import PopupElement from '../popups';
import {IconTsx} from '../iconTsx';

export const MediaEditor = ({
  close
}: {
  close: () => void
}) => {
  return (
    <div class={'media-editor-container'}>
      <div class={'media-editor-container-workspace'}>
      </div>
      <div class={'media-editor-container-toolbar'}>
        <div class={'media-editor-container-toolbar-header'}>
          <div class={'media-editor-container-toolbar-header-btn-close'}>
            <button class={'btn-icon'}>
              <IconTsx icon={'close'}/>
            </button>
          </div>
          <div class={'media-editor-container-toolbar-header-title'}>
          Edit
          </div>
          <div class={'media-editor-container-toolbar-header-nav-btns'}>
            <button class={'btn-icon'}>
              <IconTsx icon={'undo'}/>
            </button>
            <button class={'btn-icon'}>
              <IconTsx icon={'redo'}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const openMediaEditor = () => {
  const mediaEditorPopup = new PopupElement('media-editor-popup', {body: true});

  mediaEditorPopup.show();

  const close = () => {
    mediaEditorPopup.hide();
  }
  mediaEditorPopup.appendSolid(() => <MediaEditor close={close}/>);
}
