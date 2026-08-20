import { Link } from "react-router-dom";
const Logo = () => {
  return (
    <div
      style={{
        display: "flex",
        marginLeft: "0",
        alignItems: "center",
      }}
    >
      <Link to={"/"}>
        <img
          src="openai.png"
          alt="openai"
          width={"30px"}
          height={"30px"}
          className="image-inverted"
        />
      </Link>
    </div>
  );
};

export default Logo;