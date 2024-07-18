import { Accordion, AccordionItem, Chip, Button } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { BiCopyAlt, BiPlayCircle } from 'react-icons/bi';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useSettings } from '@/lib/useSettings';

export const Chat = ({ data, player }) => {
  const { t } = useTranslation();
  const { Language } = useSettings();
  const handleCopy = () => {
    navigator.clipboard.writeText(
      data.question + '\n\nmodel:' + data.model + '\n\n' + data.answer
    );
  };
  const handlePlay = () => {
    // player(data.answer);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(data.answer);
      utterance.lang = "zh-CN"
      speechSynthesis.speak(utterance);
  } else {
      alert('Sorry, your browser does not support speech synthesis.');
  }
  };
  return (
    <>
      {data && (
        <Accordion className="m-2 w-fit">
          <AccordionItem
            aria-label={data.question}
            title={
              <div className="lg:inline-flex flex-wrap m-2">
                <h2 className=" font-semibold m-2 text-xl  select-text">
                  {data.question}
                </h2>
                <Chip aria-label="ai model" className="m-2">
                  {data.model}
                </Chip>
                {data?.temperature && (
                  <Chip aria-label="temperature" className="m-2">
                    {data.temperature}
                  </Chip>
                )}
              </div>
            }
            subtitle={
              t('ai.question_length') +
              ' :' +
              data.question_tokens +
              ' ' +
              t('ai.answer_length') +
              ' :' +
              data.answer_tokens
            }
          >
            <div>
              <Button
                size="lg"
                onClick={handleCopy}
                variant="light"
                className=" bg-transparent  text-primary  m-3  right-6"
              >
                <BiCopyAlt className="w-8 h-8" />
              </Button>
              <Button
                size="lg"
                onClick={handlePlay}
                variant="light"
                className=" bg-transparent  text-primary  m-3  right-3"
              >
                <BiPlayCircle className="w-8 h-8" />
              </Button>
              <div className="select-text prose prose-stone dark:prose-invert lg:prose-xl max-w-fit ">
                <Markdown
                  className="select-text prose prose-stone dark:prose-invert lg:prose-xl max-w-fit "
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {data.answer}
                </Markdown>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
