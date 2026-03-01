import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
  Image,
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [generatedMatch, setGeneratedMatch] = useState<any>(null);

  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const offersQ = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    const requestsQ = query(collection(db, "requests"), orderBy("createdAt", "desc"));

    const unsubOffers = onSnapshot(offersQ, (snapshot) => {
      setOffers(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })));
    });

    const unsubRequests = onSnapshot(requestsQ, (snapshot) => {
      setRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })));
    });

    return () => {
      unsubOffers();
      unsubRequests();
    };
  }, []);

  const handleTabPress = (index: number) => {
    scrollRef.current?.scrollTo({ x: width * index, animated: true });
    setActiveIndex(index);
  };

  // MOCK MATCH GENERATOR (until AI is added)
  const handleGenerateMatch = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not signed in");
      return;
    }

    try {
      const newMatchRef = await addDoc(collection(db, "matches"), {
        offerTitle: "Sample Offer",
        requestTitle: "Sample Request",
        requestOwnerUid: uid,
        status: "pending",
        createdAt: Date.now(),
      });

      const mockMatch = {
        id: newMatchRef.id,
        offerTitle: "Sample Offer",
        requestTitle: "Sample Request",
      };

      setGeneratedMatch(mockMatch);
      setMatchModalVisible(true);
    } catch (e) {
      console.log(e);
      Alert.alert("Error generating match");
    }
  };

  const handleApprove = async () => {
    if (!generatedMatch) return;

    try {
      await updateDoc(doc(db, "matches", generatedMatch.id), {
        status: "accepted",
      });

      setMatchModalVisible(false);
      navigation.navigate("MatchInbox");
    } catch (e) {
      console.log(e);
      Alert.alert("Approve failed");
    }
  };

  const handleReject = async () => {
    if (!generatedMatch) return;

    try {
      await updateDoc(doc(db, "matches", generatedMatch.id), {
        status: "rejected",
      });

      setMatchModalVisible(false);
      navigation.navigate("MatchInbox");
    } catch (e) {
      console.log(e);
      Alert.alert("Reject failed");
    }
  };

  const renderPost = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title ?? "(no title)"}</Text>
      {!!item.category && <Text>Category: {item.category}</Text>}
      {!!item.quantity && <Text>Quantity: {item.quantity}</Text>}
      {!!item.urgency && <Text>Urgency: {item.urgency}</Text>}
      {!!item.locationText && <Text>Location: {item.locationText}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => handleTabPress(0)}>
          <Text style={[styles.tabText, activeIndex === 0 && styles.activeTab]}>
            Offers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleTabPress(1)}>
          <Text style={[styles.tabText, activeIndex === 1 && styles.activeTab]}>
            Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipe Feed */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      >
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          style={{ width }}
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          style={{ width }}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </ScrollView>

      {/* MATCH MODAL */}
      <Modal visible={matchModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ fontWeight: "700", marginBottom: 10 }}>
              Match Found!
            </Text>

            <Text>{generatedMatch?.offerTitle}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
                <Text style={{ color: "white" }}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                <Text style={{ color: "#065f46" }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <NavButton
          label="Offer"
          icon={require("../../assets/icons/offer.png")}
          onPress={() => navigation.navigate("CreateOffer")}
        />
        <NavButton
          label="Request"
          icon={require("../../assets/icons/request.png")}
          onPress={() => navigation.navigate("CreateRequest")}
        />
        <NavButton
          label="Match"
          icon={require("../../assets/icons/match.png")}
          onPress={handleGenerateMatch}
        />
        <NavButton
          label="Inbox"
          icon={require("../../assets/icons/inbox.png")}
          onPress={() => navigation.navigate("MatchInbox")}
        />
        <NavButton
          label="Dashboard"
          icon={require("../../assets/icons/dashboard.png")}
          onPress={() => navigation.navigate("Dashboard")}
        />
      </View>
    </View>
  );
}

function NavButton({ label, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Image source={icon} style={styles.navIconImage} />
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ecfdf5" },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  tabText: {
    marginHorizontal: 25,
    fontSize: 18,
    fontWeight: "600",
    color: "#065f46",
  },

  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#10b981",
    paddingBottom: 4,
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },

  cardTitle: { fontWeight: "700", marginBottom: 5 },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  navItem: { alignItems: "center" },

  navIconImage: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },

  navText: {
    fontSize: 11,
    marginTop: 3,
    color: "#065f46",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  approveBtn: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },

  rejectBtn: {
    borderWidth: 1,
    borderColor: "#10b981",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
});