import { Events } from '../../events';

export class Progress {
    hidden = true;
    onCancel: (() => void) | null = null;

    setHeader(header: string) {}
    setText(text: string) {}
    setProgress(progress: number) {}
    showCancelButton(show: boolean) {}
}