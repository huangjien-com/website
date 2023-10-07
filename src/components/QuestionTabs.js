import {
  Tab,
  Tabs,
  Card,
  CardBody,
  Button,
  Textarea,
  Tooltip,
  RadioGroup,
  Radio,
  Input,
  Spinner,
} from '@nextui-org/react';
import { useState, useRef } from 'react';
import {
  BiMessageRoundedDetail,
  BiMicrophone,
  BiSolidThermometer,
  BiTimer,
} from 'react-icons/bi';
import { error, success, warn } from '../components/Notification';
import { useGithubContent } from '../lib/useGithubContent';
import { useSettings } from '../lib/useSettings';
import { useLocalStorageState } from 'ahooks';
import { useTranslation } from 'react-i18next';

const getAnswer = async (question, lastAnswer) => {
  var questionArray = [{ role: 'user', content: question }];
  // if lastAnser too long or too long ago, then we don't add it.
  if (lastAnswer && lastAnswer.length < 1024) {
    questionArray.unshift({ role: 'assistant', content: lastAnswer });
  }
  const requestBody = {
    model: 'gpt-4-0613',
    messages: questionArray,
    temperature: 0.5,
  };

  return await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    });
  // .catch(err => {
  // console.log(err)
  // err.message += '\n' + requestBody
  //   throw err;
  // })
  // .catch(err => {
  //   console.log(err)
  //   error("Error Code: " + err.code + "  \n  " + err.message)
  // });
};

export const QuestionTabs = ({ append }) => {
  // append is the method add Q and A to parent content list
  const [hold, setHold] = useState(false);
  const [longPressDetected, setLongPressDetected] = useState(false);
  let pressTimer = null;
  const { languageCode, speakerName } = useSettings();
  const { getHtml } = useGithubContent();
  const mediaRecorder = useRef(null);
  const [questionText, setQuestionText] = useState('');
  const [lastAnswer, setLastAnswer] = useLocalStorageState('LastAnswer', {
    defaultValue: '',
  });
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState('');
  const [audio, setAudio] = useState(true);
  const mimeType = 'audio/mp3';

  const [stream, setStream] = useState(null);

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          setStream(stream);
        })
        .catch((err) => {
          error(`The following getUserMedia error occurred: ${err}`);
        });
    } else {
      warn('getUserMedia not supported on your browser!');
    }
    await navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setStream(stream);
        mediaRecorder.current = new MediaRecorder(stream, { type: mimeType });
        mediaRecorder.current.start();
        const localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
          if (typeof event.data == 'undefined') return;
          if (event.data.size == 0) return;
          localAudioChunks.push(event.data);
        };
        setAudio(localAudioChunks);
      });
  };
  const stopRecording = async () => {
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audio, { type: mimeType });

      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);

      setAudio([]);
      // clear the browser status, without this line, the browser tab wil indicate that it is recording
      stream.getTracks().forEach((track) => track.stop());

      const file = new File([audioBlob], 'audio.mp3', { type: mimeType });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-1');

      fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((response) => {
          if (response?.error) {
            error(response.error.message);
          } else {
            // setQuestionText(response.text)
            setQuestionText(response.text);
            // console.log(response);
          }
        })
        .catch((err) => {
          error(err.code + '\n' + err.message);
        });
    };
  };

  const startPress = () => {
    setLongPressDetected(false);
    pressTimer = setTimeout(() => {
      console.log('Long Press Triggered');
      setHold(true);
      setLongPressDetected(true);
      startRecording();
    }, 300);
  };

  const endPress = () => {
    clearTimeout(pressTimer);
    if (longPressDetected) {
      console.log('Long Press Released');
      stopRecording();
    } else {
      console.log('Short Press Triggered', questionText);
      if (questionText === undefined || questionText?.length < 5) {
        warn('Please input a meaningful question');
      } else {
        request2AI();
      }
    }
    setHold(false);
    setLongPressDetected(false);
  };

  function request2AI() {
    setLoading(true);
    getAnswer(questionText, lastAnswer)
      .then((data) => {
        if (data.error) {
          error(
            t('ai.return_error') +
              ':\n' +
              data.error.code +
              '\n' +
              data.error.message
          );
          setLoading(false);
          throw new Error(t('ai.return_error') + ':\n' + data.error.message);
        }
        // add question and answer to content
        var newQandA = {
          question: questionText,
          answer: data.choices[0].message.content,
          key: data.id,
          id: data.id,
          timestamp: data.created,
          model: data.model,
          question_tokens: data.usage.prompt_tokens,
          answer_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens,
        };
        setLastAnswer(newQandA.answer); // store last answer so that we can compare it later.  If the user answers the wrong way, it will be the last correct
        success(t('ai.return_length') + ': ' + data.usage.completion_tokens);
        return newQandA;
      })
      .then((qAndA) => {
        getHtml(qAndA.question).then((html) => (qAndA.questionHtml = html));
        getHtml(qAndA.answer)
          .then((html) => {
            qAndA.html = html;
            return qAndA;
          })
          .then((qAndA) => {
            append(qAndA);
            setQuestionText('');
            setLoading(false);
          });
      });
  }

  return (
    <Tabs
      radius="md w-auto m-2"
      size="lg"
      classNames={{
        tabList: 'gap-1 justify-evenly w-full relative rounded m-0 ',
        cursor: 'w-full ',
        tab: 'w-fit  h-12',
      }}
    >
      <Tab title={<h2 className=" text-xl">AI Conversation</h2>}>
        <Card>
          <CardBody>
            {loading && (
              <Spinner size="lg" color="success" className=" text-overlay" />
            )}
            <div className=" inline-flex justify-items-stretch items-stretch justify-between">
              <Textarea
                si
                aria-label="question text area"
                className="text-xl inline-block font-bold m-1 lg:w-10/12 sm:w-8/12 max-h-full"
                isDisabled={loading}
                value={questionText}
                onValueChange={(e) => setQuestionText(e)}
              />

              <Tooltip
                placement="bottom"
                content={
                  <div className="px-1 py-2">
                    <div className="text-small">Clik to send the question</div>
                    <div className="text-small">Hold to voice input</div>
                  </div>
                }
              >
                <Button
                  type="button"
                  aria-label="send"
                  onPressStart={startPress}
                  onPressEnd={endPress}
                  isDisabled={loading}
                  className=" justify-center text-success items-center flex flex-col m-3 lg:w-2/12 sm:w-4/12 max-h-full"
                >
                  {hold && (
                    <BiMicrophone
                      className=" text-red-500 animate-ping"
                      size={'2em'}
                    />
                  )}
                  {!hold && <BiMessageRoundedDetail size={'2em'} />}
                </Button>
              </Tooltip>
            </div>
          </CardBody>
        </Card>
      </Tab>
      <Tab title={<h2 className=" text-xl">Configuration</h2>}>
        <Card>
          <CardBody>
            <div className="  min-h-unit-16 lg:inline-flex  items-stretch justify-evenly sm:overflow-auto">
              <card>
                <CardBody>
                  <RadioGroup
                    label={
                      <h3 className=" text-xl font-bold">Select AI model</h3>
                    }
                    orientation="horizontal"
                    defaultValue={'gpt-4-0613'}
                  >
                    <Radio value="gpt-4-0613">GPT-4</Radio>
                    <Radio value="gpt-3.5-turbo-16k-0613">GPT-3.5-16K</Radio>
                    <Radio value="gpt-3.5-turbo-0613">GPT-3.5</Radio>
                    <Radio value="bard" isDisabled>
                      Google Bard
                    </Radio>
                  </RadioGroup>
                </CardBody>
              </card>

              <card>
                <CardBody>
                  <Input
                    size="lg"
                    defaultValue={0.5}
                    type="number"
                    label={
                      <h3 className=" text-xl font-bold">
                        Softmax Temperature
                      </h3>
                    }
                    placeholder="The value must between 0 and 1"
                    labelPlacement="outside"
                    startContent={
                      <BiSolidThermometer className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                </CardBody>
              </card>
              <card>
                <CardBody>
                  <Input
                    size="lg"
                    defaultValue={300}
                    type="number"
                    label={<h3 className=" text-xl font-bold">Track Speed</h3>}
                    placeholder="The value must between 50 and 500"
                    labelPlacement="outside"
                    startContent={
                      <BiTimer className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    }
                  />
                </CardBody>
              </card>
              <card>
                <CardBody>
                  <h3 className=" text-xl font-bold">Audio Player</h3>
                  <audio
                    disabled={!audioSrc}
                    controls
                    autoPlay
                    src={audioSrc}
                  />
                </CardBody>
              </card>
            </div>
          </CardBody>
        </Card>
      </Tab>
    </Tabs>
  );
};
