import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { AppDispatch, RootState } from "~/store";

import styles from "./Question.module.scss";

import { Header } from "~/components/Header/Header";

import fullStar from "~/assets/images/پر.png";
import emptyStar from "~/assets/images/خالی.png";
import image from "~/assets/images/روز برنامه نویس.png";
import arrow from "~/assets/images/Arrow Left.png";
import { Question as QuestionType, QuestionInfo } from "~/types";
import { questionActions } from "~/store/questions.slice";
import { Loading } from "~/components";
import clsx from "clsx";
import { getDir } from "~/utils";
import { baseUrl } from "~/api/configApi";
import { Typing } from "../typing/Typing";

export const Question = () => {
  const { questions } = useSelector((state: RootState) => state.questions);
  const { id } = useParams();
  const [questionInfo, setQuestionInfo] = useState<QuestionInfo | null>(null);
  const [result, setResult] = useState<string>("");
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const { token } = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();
  useEffect(() => {
    const question = questions.find((_, index) => index + 1 === +id!);

    if (question?.id) {
      setQuestion(question);
      const cb = (questionInfo: QuestionInfo) => setQuestionInfo(questionInfo);
      dispatch(
        questionActions.getOneQusetion({
          id: question.id,
          cb,
          user_token: token,
        })
      );
    }
  }, [questions, id]);

  const handleSubmit = () => {
    const cb = () => navigate("/score-board");
    if (id && result.trim().length !== 0) {
      dispatch(
        questionActions.sendQuestionResult({
          id: question?.id ?? "1",
          result,
          cb,
          user_token: token,
          point: question?.score ?? 100,
        })
      );
    }
  };

  const convertTextToValidText = (text?: string) => {
    if (!text) return { text: "", links: [] };
    const linkAndText = text.split(";;");
    let links: string[] | string | [] =
      linkAndText.length === 2 ? linkAndText[0] : [];
    const validText =
      linkAndText.length === 2 ? linkAndText[1] : linkAndText[0];

    if (links.length > 0) {
      links = (links as string).split(",");
    }
    return { text: validText, links: links as string[] };
  };

  const handleChangeResult = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setResult(value);
  };

  const { text, links } = convertTextToValidText(questionInfo?.text);

  const renderQuestion =
    questionInfo &&
    question &&
    ["TypingLeft", "TypingRight"].includes(questionInfo.title) ? (
      <Typing
        qid={question.id}
        qTitle={questionInfo.title}
        qPoint={question.score}
      />
    ) : null;

  return (
    renderQuestion ?? (
      <div className={styles.Question} dir="rtl">
        <Header />
        {!questionInfo ? (
          <Loading />
        ) : (
          <div className={styles.body}>
            <div className={styles.QuestionBox}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  position: "relative",
                }}
              >
                <div className={styles.TitleBar}>
                  <div className={styles.QuestionTitle}>
                    {questionInfo?.title}
                  </div>
                  <div className={styles.QuestionOther}>
                    <div className={styles.category}>
                      <span className={styles.categoryText}>درجه سختی</span>
                      <div className={styles.StarBox}>
                        {Array(3)
                          .fill(0)
                          .map((_, index) => (
                            <img
                              key={index}
                              src={
                                index + 1 > questionInfo.cost
                                  ? emptyStar
                                  : fullStar
                              }
                              className={styles.icon}
                              alt=""
                            />
                          ))}
                      </div>
                    </div>
                    <div className={styles.category}>
                      <span className={styles.categoryText}>سوال </span>
                      <span
                        className={clsx(styles.greenText, {
                          [styles.yellow]: questionInfo.isStarred,
                        })}
                      >
                        {/* {questionInfo.isStarred ? "طلایی" : "عادی"} */}
                        {question?.score} امتیازی
                      </span>
                    </div>
                    <img
                      width={35}
                      src={arrow}
                      alt=""
                      onClick={() => navigate(-1)}
                    />
                  </div>
                </div>
                <div className={styles.Line} />
              </div>
              {links.length === 1 && (
                <div className={styles.Poster}>
                  <img src={links[0]} />
                </div>
              )}
              <pre
                className={styles.QuestionText}
                style={{ direction: getDir(text) }}
              >
                {text}
              </pre>
              <div className={styles.assets}>
                {links.length > 0 &&
                  links.slice(1).map((link) => (
                    <div className={styles.assetBox} key={link}>
                      <img className={styles.assetImg} src={link} alt="" />
                      <span className={styles.assetText}>
                        {link.split("//")[1].split(".")[0]}
                      </span>
                    </div>
                  ))}
                {questionInfo.has_zip && (
                  <div className={styles.assetBox}>
                    <a
                      href={`${baseUrl}/${questionInfo.zip_file_url}`}
                      className={styles.assetZip}
                      dir="ltr"
                      target="_blank"
                    >
                      File Zip! Click to download.
                    </a>
                  </div>
                )}
              </div>
              {!question?.isAnswerd && (
                <div className={styles.SubmitBar}>
                  <input
                    className={styles.SubmitBox}
                    type="text"
                    placeholder="پاسخ خود را وارد کنید"
                    onChange={handleChangeResult}
                    style={{ direction: result ? getDir(result) : "rtl" }}
                  />
                  <div>
                    <button
                      className={clsx(styles.Submit, styles.SubmitTxt)}
                      onClick={handleSubmit}
                    >
                      ثبت
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  );
};