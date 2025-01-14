import React from "react";
import { View, Text } from "react-native";
import { User } from "../stores";
import { observer } from "mobx-react";
import { OBRest, Restrictions } from "etrest";
import { Avatar } from "react-native-paper";
import { QUATERNARY_100, TERCIARY_100 } from "../styles/colors";

interface Props {
  username: string;
  size: number;
}

interface State {
  image: string;
}

@observer
class ShowProfilePicture extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      image: null
    };
  }

  componentDidMount = async () => {
    this.setState({ image: await this.getImage() });
    this;
  };

  getImage = async () => {
    let imageIdCriteria = OBRest.getInstance().createCriteria("ADUser");
    imageIdCriteria.add(Restrictions.equals("id", User.data.userId));
    let user: any = await imageIdCriteria.uniqueResult();
    let imageCriteria = OBRest.getInstance().createCriteria("ADImage");
    imageCriteria.add(Restrictions.equals("id", user.image));
    let image: any = await imageCriteria.list();
    return image;
  };

  getInitials = function(string) {
    var names = string.split(" "),
      initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  render = () => {
    if (this.state.image) {
      return this.state.image.map((imag, index) => {
        console.log(imag.bin);
        if (
          imag.bindaryData !== " " ||
          imag.bindaryData !== null ||
          imag.bindaryData !== undefined
        ) {
          return (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 80
              }}
              key={index}
            >
              <Avatar.Image
                size={this.props.size}
                source={{
                  uri: `data:image/jpeg;base64,${imag.bindaryData}`
                }}
              />
            </View>
          );
        }
      });
    } else {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 80
          }}
        >
          <Avatar.Text
            size={this.props.size}
            label={this.getInitials(this.props.username)}
            style={{ backgroundColor: TERCIARY_100 }}
            labelStyle={{ color: QUATERNARY_100 }}
          />
        </View>
      );
    }
  };
}

export default ShowProfilePicture;
