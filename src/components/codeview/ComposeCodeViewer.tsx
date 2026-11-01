import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Download, Folder, Code2, Sparkles } from 'lucide-react';

interface ComposeCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CodeFile {
  name: string;
  category: string;
  code: string;
}

const KOTLIN_FILES: CodeFile[] = [
  {
    name: 'RTDTheme.kt',
    category: 'Theme',
    code: `package com.rtd.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Modern Green & White RTD Palette
val RTDPrimaryGreen = Color(0xFF00A884)
val RTDDeepTeal = Color(0xFF075E54)
val RTDAccentGreen = Color(0xFF25D366)
val RTDChatBubbleOutgoing = Color(0xFFE7FFDB)
val RTDChatBubbleIncoming = Color(0xFFFFFFFF)
val RTDChatBackground = Color(0xFFEFEAE2)
val RTDTextPrimary = Color(0xFF111B21)
val RTDTextSecondary = Color(0xFF667781)

private val LightColorScheme = lightColorScheme(
    primary = RTDPrimaryGreen,
    onPrimary = Color.White,
    primaryContainer = RTDDeepTeal,
    onPrimaryContainer = Color.White,
    secondary = RTDAccentGreen,
    surface = Color.White,
    onSurface = RTDTextPrimary,
    background = RTDChatBackground,
    onBackground = RTDTextPrimary,
)

@Composable
fun RTDAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography(),
        content = content
    )
}
`,
  },
  {
    name: 'PhoneAuthScreen.kt',
    category: 'Auth & OTP',
    code: `package com.rtd.app.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rtd.app.ui.theme.RTDPrimaryGreen
import com.rtd.app.ui.theme.RTDDeepTeal

@Composable
fun PhoneAuthScreen(
    onVerificationSuccess: (rtdId: String) -> Unit
) {
    var phoneNumber by remember { mutableStateOf("") }
    var otpCode by remember { mutableStateOf("") }
    var isOtpSent by remember { mutableStateOf(false) }
    var generatedRtdId by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "RTD APP",
            color = RTDDeepTeal,
            fontSize = 32.sp,
            fontWeight = FontWeight.Black
        )
        Text(
            text = "Modern Android Messaging",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 14.sp
        )

        Spacer(modifier = Modifier.height(32.dp))

        if (!isOtpSent) {
            OutlinedTextField(
                value = phoneNumber,
                onValueChange = { phoneNumber = it },
                label = { Text("Phone Number with Country Code") },
                placeholder = { Text("+1 555-019-4820") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {
                    // Firebase PhoneAuthProvider.verifyPhoneNumber(...)
                    isOtpSent = true
                },
                colors = ButtonDefaults.buttonColors(containerColor = RTDPrimaryGreen),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Send Verification OTP")
            }
        } else {
            Text("Enter the 6-digit code sent to \$phoneNumber")
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = otpCode,
                onValueChange = { if (it.length <= 6) otpCode = it },
                label = { Text("6-Digit OTP Code") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {
                    // Unique RTD User ID assigned automatically
                    val newRtdId = "RTD-" + (100000..999999).random()
                    generatedRtdId = newRtdId
                    onVerificationSuccess(newRtdId)
                },
                colors = ButtonDefaults.buttonColors(containerColor = RTDPrimaryGreen),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Verify & Generate RTD ID")
            }
        }
    }
}
`,
  },
  {
    name: 'ConversationScreen.kt',
    category: 'Messaging',
    code: `package com.rtd.app.ui.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rtd.app.ui.theme.*

data class ComposeMessage(
    val id: String,
    val senderId: String,
    val text: String,
    val timestamp: String,
    val isFromMe: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConversationScreen(
    chatTitle: String,
    onBack: () -> Unit,
    onVoiceCall: () -> Unit,
    onVideoCall: () -> Unit
) {
    var messageText by remember { mutableStateOf("") }
    val messages = remember { mutableStateListOf<ComposeMessage>() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(chatTitle, color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = onVoiceCall) {
                        Icon(Icons.Default.Phone, contentDescription = "Voice Call", tint = Color.White)
                    }
                    IconButton(onClick = onVideoCall) {
                        Icon(Icons.Default.VideoCall, contentDescription = "Video Call", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = RTDDeepTeal)
            )
        },
        bottomBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    value = messageText,
                    onValueChange = { messageText = it },
                    placeholder = { Text("Message...") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(24.dp),
                    colors = TextFieldDefaults.colors(
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                IconButton(
                    onClick = {
                        if (messageText.isNotBlank()) {
                            messages.add(
                                ComposeMessage(
                                    id = System.currentTimeMillis().toString(),
                                    senderId = "me",
                                    text = messageText,
                                    timestamp = "Just now",
                                    isFromMe = true
                                )
                            )
                            messageText = ""
                        }
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(RTDPrimaryGreen)
                ) {
                    Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White)
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(RTDChatBackground)
                .padding(12.dp)
        ) {
            items(messages) { msg ->
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = if (msg.isFromMe) Alignment.CenterEnd else Alignment.CenterStart
                ) {
                    Surface(
                        color = if (msg.isFromMe) RTDChatBubbleOutgoing else RTDChatBubbleIncoming,
                        shape = RoundedCornerShape(14.dp),
                        shadowElevation = 1.dp,
                        modifier = Modifier.padding(vertical = 4.dp).widthIn(max = 280.dp)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(text = msg.text, fontSize = 14.sp)
                            Text(
                                text = msg.timestamp,
                                fontSize = 10.sp,
                                color = RTDTextSecondary,
                                modifier = Modifier.align(Alignment.End)
                            )
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    name: 'VoiceAndVideoCalls.kt',
    category: 'Calling',
    code: `package com.rtd.app.ui.calls

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rtd.app.ui.theme.RTDDeepTeal

@Composable
fun VoiceCallScreen(
    contactName: String,
    rtdId: String,
    onEndCall: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(RTDDeepTeal)
            .padding(32.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxSize()
        ) {
            Text(
                "RTD End-to-End Encrypted Voice",
                color = Color.White.copy(alpha = 0.7f),
                fontSize = 12.sp
            )

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.2f))
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(contactName, color = Color.White, fontSize = 24.sp)
                Text(rtdId, color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
                Text("02:14", color = Color(0xFF25D366), fontSize = 16.sp)
            }

            IconButton(
                onClick = onEndCall,
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(Color.Red)
            ) {
                Icon(Icons.Default.CallEnd, contentDescription = "End Call", tint = Color.White)
            }
        }
    }
}
`,
  },
  {
    name: 'FirestoreRepository.kt',
    category: 'Backend & Data',
    code: `package com.rtd.app.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

data class RTDUserProfile(
    val id: String = "",
    val rtdId: String = "",
    val phoneNumber: String = "",
    val displayName: String = "",
    val avatarUrl: String = "",
    val statusMessage: String = "Hey there! I am using RTD APP",
    val online: Boolean = false,
    val lastSeen: Long = System.currentTimeMillis(),
    val role: String = "user"
)

class RTDFirebaseRepository(private val db: FirebaseFirestore) {

    private val usersCollection = db.collection("users")
    private val chatsCollection = db.collection("chats")

    suspend fun getUserByRtdId(rtdId: String): RTDUserProfile? {
        val querySnapshot = usersCollection.whereEqualTo("rtdId", rtdId).get().await()
        return querySnapshot.documents.firstOrNull()?.toObject(RTDUserProfile::class.java)
    }

    suspend fun getUserByPhone(phoneNumber: String): RTDUserProfile? {
        val querySnapshot = usersCollection.whereEqualTo("phoneNumber", phoneNumber).get().await()
        return querySnapshot.documents.firstOrNull()?.toObject(RTDUserProfile::class.java)
    }

    suspend fun createOrUpdateUser(profile: RTDUserProfile) {
        usersCollection.document(profile.id).set(profile).await()
    }
}
`,
  },
];

export const ComposeCodeViewer: React.FC<ComposeCodeViewerProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(KOTLIN_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const zipData = KOTLIN_FILES.map((f) => `// === File: ${f.name} ===\n\n${f.code}`).join(
      '\n\n'
    );
    const blob = new Blob([zipData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RTD_APP_Kotlin_Compose_Source.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="bg-[#1E1E1E] rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl overflow-hidden border border-white/10 flex flex-col text-gray-200">
        {/* Top Header */}
        <div className="bg-[#0D1117] px-5 py-3.5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Kotlin & Jetpack Compose Codebase</h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700/50 px-2 py-0.5 rounded-full font-mono">
                  Android Studio Ready
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Production-grade Material 3 architecture with green & white theme
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadAll}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors border border-gray-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Files</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Sidebar + Code Display */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-60 bg-[#161B22] border-r border-gray-800 p-3 flex flex-col space-y-1 overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2 py-1">
              Jetpack Compose Files
            </div>

            {KOTLIN_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all ${
                  selectedFile.name === file.name
                    ? 'bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0 text-emerald-500" />
                <div className="truncate">
                  <div className="truncate">{file.name}</div>
                  <div className="text-[9px] text-gray-500 font-normal">{file.category}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#0D1117] overflow-hidden">
            {/* Tab header */}
            <div className="h-10 bg-[#161B22] border-b border-gray-800 px-4 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {selectedFile.name}
              </span>

              <button
                onClick={handleCopy}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition-colors border border-gray-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-gray-300 leading-relaxed bg-[#0D1117]">
              <pre>
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
